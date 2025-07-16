const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorizeRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// CREATE Project with Tasks (Manager only)
router.post('/', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const { name, description, startDate, tasks } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        createdById: req.user.id,
        managerId: req.user.id,
        tasks: {
          create: tasks ? tasks.map(task => ({
            title: task.title,
            description: task.description,
            priority: task.priority || 'MEDIUM'
          })) : []
        }
      },
      include: {
        tasks: true,
        createdBy: true
      }
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LIST all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { 
        createdBy: true,
        tasks: true
      },
      orderBy: { startDate: 'desc' },
    });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET engineer's assigned projects (Engineer only)
router.get('/assigned', authenticate, authorizeRole('ENGINEER'), async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
      where: { userId: req.user.id },
      include: {
        project: {
          include: {
            assignments: { include: { user: true, task: true } }, // <-- include task here!
            tasks: { include: { assignedTo: true } }
          }
        }
      }
    });

    // Remove duplicate projects
    const seen = new Set();
    const assignedProjects = [];
    for (const a of assignments) {
      if (!seen.has(a.project.id)) {
        assignedProjects.push(a.project);
        seen.add(a.project.id);
      }
    }
    res.status(200).json(assignedProjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single project by ID
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignments: { include: { user: true, task: true } },
        tasks: {
          include: {
            assignments: { include: { user: true } },
            assignedTo: true,
            comments: { include: { author: true } }
          }
        },
        createdBy: true,
      },
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.status(200).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add task to existing project
router.post('/:id/tasks', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const projectId = parseInt(req.params.id);
  const { title, description, priority } = req.body;
  
  try {
    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        projectId
      },
      include: {
        assignedTo: true
      }
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task assignment
router.put('/tasks/:taskId/assign', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const { assignedToId } = req.body;
  
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { assignedToId },
      include: {
        assignedTo: true
      }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task status
router.put('/tasks/:taskId/status', authenticate, async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const { status } = req.body;
  
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        assignedTo: true
      }
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Engineer requests completion (already present, but ensure it exists)
router.post('/tasks/:taskId/request-completion', authenticate, authorizeRole('ENGINEER'), async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completionRequested: true },
      include: { project: true, assignedTo: true }
    });
    // Notify the manager (or super-admin) of the project
    if (task.project && task.project.managerId) {
      await prisma.notification.create({
        data: {
          userId: task.project.managerId,
          type: 'COMPLETION_REQUESTED',
          message: `Completion requested by ${task.assignedTo?.name || 'an engineer'} for task ${task.title} in project ${task.project.name}`
        }
      });
    }
    res.json({ message: 'Completion requested', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manager approves completion
router.post('/tasks/:taskId/approve-completion', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status: 'COMPLETED', completionRequested: false },
      include: { project: true } // <-- include project for notification
    });
    // Increment tasksCompleted for the assigned engineer, if any
    if (task.assignedToId) {
      await prisma.user.update({
        where: { id: task.assignedToId },
        data: { tasksCompleted: { increment: 1 } }
      });
      // Recalculate and update performance
      const freshUser = await prisma.user.findUnique({ where: { id: task.assignedToId } });
      const { projectsAssigned = 0, tasksCompleted = 0 } = freshUser;
      let performance = "Needs Improvement";
      if (projectsAssigned > 0) {
        const ratio = tasksCompleted / projectsAssigned;
        if (tasksCompleted >= projectsAssigned) performance = "Excellent";
        else if (ratio >= 0.75) performance = "Good";
        else if (ratio >= 0.5) performance = "Average";
      } else {
        performance = "No Projects Assigned";
      }
      console.log("Updating performance for user", freshUser.id, "to", performance);
      await prisma.user.update({
        where: { id: freshUser.id },
        data: { performance }
      });
      console.log("Performance updated!");
      // Send notification to engineer
      await prisma.notification.create({
        data: {
          userId: task.assignedToId,
          type: 'COMPLETION_APPROVED',
          message: `Your completion request for task "${task.title}" in project "${task.project?.name || ''}" was approved.`
        }
      });
    }
    res.json({ message: 'Task marked as completed', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manager rejects completion
router.post('/tasks/:taskId/reject-completion', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  try {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { completionRequested: false },
      include: { project: true } // <-- include project for notification
    });
    // Send notification to engineer if assigned
    if (task.assignedToId) {
      await prisma.notification.create({
        data: {
          userId: task.assignedToId,
          type: 'COMPLETION_REJECTED',
          message: `Your completion request for task "${task.title}" in project "${task.project?.name || ''}" was rejected.`
        }
      });
    }
    res.json({ message: 'Completion request rejected', task });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a comment to a task
router.post('/tasks/:taskId/comments', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment content required' });

  try {
    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        authorId: req.user.id,
        content,
      },
      include: { author: true }
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments for a task
router.get('/tasks/:taskId/comments', authenticate, async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  try {
    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      include: { author: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comment count for a task
router.get('/tasks/:taskId/comments/count', authenticate, async (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  if (!taskId) return res.status(400).json({ count: 0 });
  try {
    const count = await prisma.taskComment.count({ where: { taskId } });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ count: 0 });
  }
});

// Delete all comments for a task
router.delete('/tasks/:taskId/comments', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const taskId = parseInt(req.params.taskId);
  try {
    await prisma.taskComment.deleteMany({ where: { taskId } });
    res.json({ message: 'All comments deleted for this task.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /projects/:id (update project, tasks, and assignments)
router.put('/:id', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  const { name, description, tasks: updatedTasks } = req.body;

  try {
    // 1. Fetch current project with tasks
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true },
    });
    if (!existingProject) return res.status(404).json({ error: 'Project not found' });

    // 2. Prepare task ID sets
    const oldTasks = existingProject.tasks;
    const oldTaskIds = new Set(oldTasks.map(t => t.id));
    const newTaskIds = new Set(updatedTasks.filter(t => t.id).map(t => t.id));

    // 3. Find removed tasks
    const removedTaskIds = [...oldTaskIds].filter(id => !newTaskIds.has(id));

    // 4. Delete assignments and comments for removed tasks, then delete tasks
    if (removedTaskIds.length > 0) {
      await prisma.taskComment.deleteMany({ where: { taskId: { in: removedTaskIds } } });
      await prisma.assignment.deleteMany({ where: { taskId: { in: removedTaskIds } } });
      await prisma.task.deleteMany({ where: { id: { in: removedTaskIds } } });
    }

    // 5. Update existing tasks (do not touch assignments)
    for (const task of updatedTasks) {
      if (task.id) {
        await prisma.task.update({
          where: { id: task.id },
          data: {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            // ...other fields as needed
          }
        });
      }
    }

    // 6. Add new tasks
    for (const task of updatedTasks) {
      if (!task.id) {
        await prisma.task.create({
          data: {
            title: task.title,
            description: task.description,
            status: task.status || 'PENDING',
            priority: task.priority || 'MEDIUM',
            projectId: projectId,
            // ...other fields as needed
          }
        });
      }
    }

    // 7. Update project details
    await prisma.project.update({
      where: { id: projectId },
      data: { name, description }
    });

    // 8. Return updated project with tasks, assignments, and comments
    const updatedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: {
          include: {
            assignments: { include: { user: true } },
            comments: { include: { author: true } }
          }
        },
        assignments: { include: { user: true, task: true } }
      }
    });

    res.json(updatedProject);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// SOFT-CLOSE a project (Manager only)
router.post('/:id/close', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const projectId = parseInt(req.params.id);
  try {
    // 1. Backup assignments
    const assignments = await prisma.assignment.findMany({ where: { projectId } });
    for (const a of assignments) {
      await prisma.assignmentBackup.create({
        data: {
          userId: a.userId,
          projectId: a.projectId,
          taskId: a.taskId,
          allocation: a.allocation,
          role: a.role,
          startDate: a.startDate,
          endDate: a.endDate,
        }
      });
    }

    // 2. Unassign engineers from tasks
    for (const a of assignments) {
      if (a.taskId) {
        await prisma.task.update({
          where: { id: a.taskId },
          data: { assignedToId: null }
        });
      }
    }

    // 3. Delete assignments
    await prisma.assignment.deleteMany({ where: { projectId } });

    // 4. Mark project as closed
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { isClosed: true }
    });
    res.json({ message: 'Project closed successfully', project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// RE-OPEN a project (Manager only)
router.post('/:id/reopen', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const projectId = parseInt(req.params.id);
  try {
    // 1. Restore assignments
    const backups = await prisma.assignmentBackup.findMany({ where: { projectId } });
    for (const b of backups) {
      await prisma.assignment.create({
        data: {
          userId: b.userId,
          projectId: b.projectId,
          taskId: b.taskId,
          allocation: b.allocation,
          role: b.role,
          startDate: b.startDate,
          endDate: b.endDate,
        }
      });
      // Re-assign engineer to task
      if (b.taskId && b.userId) {
        await prisma.task.update({
          where: { id: b.taskId },
          data: { assignedToId: b.userId }
        });
      }
    }

    // 2. Delete backups
    await prisma.assignmentBackup.deleteMany({ where: { projectId } });

    // 3. Mark project as open
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { isClosed: false }
    });
    res.json({ message: 'Project re-opened successfully', project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a project (Manager only)
router.delete('/:id', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const projectId = parseInt(req.params.id);
  try {
    // 1. Find all task IDs for this project
    const tasks = await prisma.task.findMany({ where: { projectId } });
    const taskIds = tasks.map(t => t.id);
    // 2. Delete all comments for these tasks
    if (taskIds.length > 0) {
      await prisma.taskComment.deleteMany({ where: { taskId: { in: taskIds } } });
    }
    // 3. Delete assignments and tasks
    await prisma.assignment.deleteMany({ where: { projectId } });
    await prisma.task.deleteMany({ where: { projectId } });
    // 4. Delete the project
    const deleted = await prisma.project.delete({
      where: { id: projectId },
    });
    res.json({ message: 'Project deleted successfully', project: deleted });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
