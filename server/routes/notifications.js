const express = require('express');
const router = express.Router();
const prisma = require('../prisma/client');
const { authenticate } = require('../middleware/auth');

// Get all notifications for the current user (newest first)
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
});

// Mark a notification as read
router.post('/mark-read', authenticate, async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: 'Notification id required.' });
  try {
    await prisma.notification.update({
      where: { id: parseInt(id) },
      data: { read: true },
    });
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notification as read.' });
  }
});

// Delete all read notifications for the current user
router.delete('/clear-read', authenticate, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { userId: req.user.id, read: true }
    });
    res.json({ message: 'All read notifications cleared.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear read notifications.' });
  }
});

module.exports = router; 