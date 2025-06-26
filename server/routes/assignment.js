const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorizeRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// Manager assigns engineer to a project
router.post('/', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const { userId, projectId, allocation } = req.body;

  // Basic input validation
  if (!userId || !projectId || allocation === undefined) {
    return res.status(400).json({ message: 'userId, projectId, and allocation are required' });
  }

  // Validate allocation is between 0 and 100
  if (allocation < 0 || allocation > 100) {
    return res.status(400).json({ message: 'Allocation must be between 0 and 100%' });
  }

  try {
    // Get total current allocation for the engineer
    const existingAssignments = await prisma.assignment.findMany({
      where: { userId },
      select: { allocation: true },
    });

    const totalAllocation = existingAssignments.reduce((sum, a) => sum + a.allocation, 0);

    // Check if new allocation exceeds 100%
    if (totalAllocation + allocation > 100) {
      return res.status(400).json({
        message: `Engineer already allocated ${totalAllocation}%. Cannot assign additional ${allocation}%.`,
      });
    }

    // Create new assignment
    const assignment = await prisma.assignment.create({
      data: { userId, projectId, allocation },
    });

    res.status(201).json({ message: 'Engineer assigned successfully', assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all assignments (optionally filtered by userId or projectId)
router.get('/', authenticate, async (req, res) => {
  const { userId, projectId } = req.query;

  try {
    const assignments = await prisma.assignment.findMany({
      where: {
        userId: userId ? parseInt(userId) : undefined,
        projectId: projectId ? parseInt(projectId) : undefined,
      },
      include: {
        user: true,
        project: true,
      },
    });

    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unassign engineer from project
router.delete('/:id', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.assignment.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
