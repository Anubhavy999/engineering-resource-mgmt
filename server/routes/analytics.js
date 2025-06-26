const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorizeRole } = require('../middleware/auth');

const prisma = new PrismaClient();

// 🚦 List all engineers and their capacity usage
router.get('/engineer-capacity', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  try {
    const engineers = await prisma.user.findMany({
      where: { role: 'ENGINEER' },
      include: {
        assignments: {
          include: { project: true },
        },
      },
    });

    const result = engineers.map((eng) => {
      const totalAllocation = eng.assignments.reduce((sum, a) => sum + a.allocation, 0);
      return {
        id: eng.id,
        name: eng.name,
        email: eng.email,
        totalAllocation,
        isAvailable: totalAllocation < 100,
        assignments: eng.assignments.map(a => ({
          project: a.project.name,
          allocation: a.allocation
        }))
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
