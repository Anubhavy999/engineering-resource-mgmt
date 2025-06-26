const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorizeRole } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/engineers', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  try {
    const engineers = await prisma.user.findMany({
      where: { role: 'ENGINEER' },
      select: { id: true, name: true, email: true }
    });

    res.json(engineers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// Update engineer profile
router.put('/:id', authenticate, authorizeRole('MANAGER'), async (req, res) => {
  const engineerId = parseInt(req.params.id);
  const { name, email, skills } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: engineerId },
      data: {
        name,
        email,
        skills,
      },
    });

    res.json({ message: 'Engineer updated', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
