const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorizeRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// 🔐 Manager-only Create Project
router.post('/', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.user.id,
      },
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🌐 Anyone can list all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { createdBy: true },
    });
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Get single project with team members
router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(id) },
      include: {
        assignments: {
          include: {
            user: true,
          },
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



// Soft-close a project
router.post('/:id/close', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const projectId = parseInt(req.params.id);

  try {
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { isClosed: true }
    });

    res.json({ message: 'Project closed successfully', project: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;


