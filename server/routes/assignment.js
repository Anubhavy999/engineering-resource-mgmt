const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorizeRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// MANAGER assigns engineer to a project
router.post('/', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const { userId, projectId, taskId, allocation } = req.body;

  if (!userId || !projectId || allocation === undefined) {
    return res.status(400).json({ message: 'userId, projectId, and allocation are required' });
  }

  if (allocation < 1 || allocation > 100) {
    return res.status(400).json({ message: 'Allocation must be between 1 and 100%' });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      select: { isClosed: true }
    });
    if (!project || project.isClosed) {
      return res.status(400).json({ message: 'Cannot assign tasks for a closed project.' });
    }

    const existingAssignments = await prisma.assignment.findMany({
      where: { userId: parseInt(userId) },
      select: { allocation: true },
    });

    const totalAllocation = existingAssignments.reduce((sum, a) => sum + a.allocation, 0);

    if (totalAllocation + parseInt(allocation) > 100) {
      return res.status(400).json({
        message: `Engineer already allocated ${totalAllocation}%. Cannot assign additional ${allocation}%.`,
      });
    }

    const assignment = await prisma.assignment.create({
      data: {
        userId: parseInt(userId),
        projectId: parseInt(projectId),
        taskId: parseInt(taskId), // <-- save the taskId
        allocation: parseInt(allocation),
      },
      include: {
        user: true,
        project: true,
        task: true,
      },
    });

    // Update the task's assignedToId
    if (taskId && userId) {
      await prisma.task.update({
        where: { id: taskId },
        data: { assignedToId: userId }
      });
    }

    // Create notification for engineer
    if (assignment.userId && assignment.task && assignment.project) {
      await prisma.notification.create({
        data: {
          userId: assignment.userId,
          type: 'TASK_ASSIGNED',
          message: `You have been assigned a new task: ${assignment.task.title} in project ${assignment.project.name}`
        }
      });
    }

    // Increment projectsAssigned if this is the first assignment for this user on this project
    const assignmentCount = await prisma.assignment.count({
      where: {
        userId: parseInt(userId),
        projectId: parseInt(projectId)
      }
    });
    if (assignmentCount === 1) {
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { projectsAssigned: { increment: 1 } }
      });
      // Recalculate and update performance
      const freshUser = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
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
      console.log("Updating performance for user", userId, "to", performance);
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { performance }
      });
      console.log("Performance updated!");
    }

    res.status(201).json({ message: 'Engineer assigned successfully', assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Shared GET for MANAGER and ENGINEER (with ?userId=me support)
router.get('/', authenticate, async (req, res) => {
  try {
    let where = {};
    // If engineer, only show their assignments
    if (req.user.role === 'ENGINEER') {
      where.userId = req.user.id;
    }
    // If manager and ?userId=me, also show only their assignments
    else if (req.query.userId === 'me') {
      where.userId = req.user.id;
    }
    // Optionally, allow managers to filter by userId
    else if (req.user.role === 'MANAGER' && req.query.userId) {
      where.userId = parseInt(req.query.userId);
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        user: true,
        project: {
          include: {
            assignments: { include: { user: true } },
          }
        },
        task: true,
      },
    });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assignments.' });
  }
});

// MANAGER deletes an assignment
router.delete('/:id', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const assignment = await prisma.assignment.findUnique({ where: { id: parseInt(req.params.id) } });

  // Unassign the engineer from the task
  if (assignment?.taskId) {
    await prisma.task.update({
      where: { id: assignment.taskId },
      data: { assignedToId: null }
    });
  }

  await prisma.assignment.delete({ where: { id: parseInt(req.params.id) } });
  res.json({ message: 'Engineer unassigned successfully.' });
});

module.exports = router;
