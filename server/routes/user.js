// server/routes/user.js

const express = require('express');
const router  = express.Router();
const prisma = require('../prisma/client');
const jwt    = require('jsonwebtoken');
const { authenticate, authorizeRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

/**
 * GET /api/users
 *   • List all users (for any manager, including super-admin)
 */
router.get(
  '/',
  authenticate,
  authorizeRole('MANAGER'),
  async (req, res) => {
    try {
      // Primary query: full profile fields
      try {
        const users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            managerId: true,
            isSuperAdmin: true,
            skills: true,
            maxCapacity: true,
            firstName: true,
            lastName: true,
            department: true,
            lastLogin: true
          }
        });
        return res.json(users);
      } catch (innerErr) {
        // Fallback: minimal fields if DB schema is behind migrations
        console.warn('Falling back to minimal user fields due to schema mismatch:', innerErr?.message);
        const basic = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            managerId: true,
            maxCapacity: true,
            skills: true,
          }
        });
        const enriched = basic.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          managerId: u.managerId ?? null,
          isSuperAdmin: false,
          skills: u.skills ?? null,
          maxCapacity: typeof u.maxCapacity === 'number' ? u.maxCapacity : 100,
          firstName: null,
          lastName: null,
          department: null,
          lastLogin: null,
        }));
        return res.json(enriched);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Server error fetching users.' });
    }
  }
);

/**
 * GET /api/users/engineers
 *   • List all engineers (for any manager, including super-admin)
 */
router.get(
  '/engineers',
  authenticate,
  authorizeRole('MANAGER'),
  async (req, res) => {
    try {
      const engineers = await prisma.user.findMany({
        where: { role: 'ENGINEER' },
        select: { id: true, name: true }
      });
      return res.json(engineers);
    } catch (err) {
      console.error('Error fetching engineers:', err);
      return res.status(500).json({ message: 'Server error fetching engineers.' });
    }
  }
);

/**
 * GET /api/users/me
 *   • Get current user's profile (self)
 */
router.get(
  '/me',
  authenticate,
  async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          managerId: true,
          isSuperAdmin: true,
          skills: true,
          maxCapacity: true,
          firstName: true,
          lastName: true,
          phone: true,
          bio: true,
          avatarUrl: true,
          country: true,
          city: true,
          postalCode: true,
          taxId: true,
          lastLogin: true,
          projectsAssigned: true,
          tasksCompleted: true,
          performance: true,
          lastPasswordChange: true,
          department: true
        }
      });
      if (!user) return res.status(404).json({ message: 'User not found.' });
      return res.json(user);
    } catch (err) {
      console.error('Error fetching current user:', err);
      return res.status(500).json({ message: 'Server error fetching current user.' });
    }
  }
);

/**
 * PATCH /api/users/me
 *   • Edit current user's profile (self)
 */
router.patch(
  '/me',
  authenticate,
  async (req, res) => {
    const id = req.user.id;
    const {
      name, firstName, lastName, phone, bio, avatarUrl,
      country, city, postalCode, taxId,
      skills, maxCapacity, performance,
      department,
      certifications, experience
    } = req.body;
    try {
      const updated = await prisma.user.update({
        where: { id },
        data: {
          name, firstName, lastName, phone, bio, avatarUrl,
          country, city, postalCode, taxId,
          skills, maxCapacity, performance,
          department,
          certifications, experience
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          managerId: true,
          isSuperAdmin: true,
          skills: true,
          maxCapacity: true,
          firstName: true,
          lastName: true,
          phone: true,
          bio: true,
          avatarUrl: true,
          country: true,
          city: true,
          postalCode: true,
          taxId: true,
          lastLogin: true,
          projectsAssigned: true,
          tasksCompleted: true,
          performance: true,
          lastPasswordChange: true,
          department: true,
          certifications: true,
          experience: true
        }
      });
      return res.json({ message: 'Profile updated.', user: updated });
    } catch (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ message: 'Server error updating profile.' });
    }
  }
);

/**
 * DELETE /api/users/me
 *   • Delete current user's account (block super-admin)
 */
router.delete(
  '/me',
  authenticate,
  async (req, res) => {
    const id = req.user.id;
    const user = await prisma.user.findUnique({ where: { id } });
    if (user.isSuperAdmin) {
      return res.status(403).json({ message: 'Super-admin cannot delete their own account.' });
    }
    await prisma.user.delete({ where: { id } });
    return res.json({ message: 'Account deleted.' });
  }
);

/**
 * POST /api/users/me/avatar
 *   • Update avatar URL (simulate upload)
 */
router.post(
  '/me/avatar',
  authenticate,
  async (req, res) => {
    const id = req.user.id;
    const { avatarUrl } = req.body;
    if (!avatarUrl) return res.status(400).json({ message: 'avatarUrl required.' });
    const updated = await prisma.user.update({
      where: { id },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true }
    });
    return res.json({ message: 'Avatar updated.', user: updated });
  }
);

/**
 * GET /api/users/me/pdf
 *   • Download profile as PDF (placeholder)
 */
router.get(
  '/me/pdf',
  authenticate,
  async (req, res) => {
    // Placeholder: In real app, generate PDF and send
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=profile.pdf');
    res.send(Buffer.from('%PDF-1.4\n% Fake PDF for profile download.\n', 'utf-8'));
  }
);

/**
 * PUT /api/users/:id/role
 *   • Toggle ENGINEER ↔ MANAGER
 *   • Super-admin can change anyone except himself and the super-admin
 *   • Managers can only promote/demote engineers, and only demote managers they promoted
 *   • Managers cannot change their promoter, the super-admin, or themselves
 */
router.put(
  '/:id/role',
  authenticate,
  authorizeRole('MANAGER'),
  async (req, res) => {
    const meId     = req.user.id;
    const targetId = parseInt(req.params.id, 10);
    const newRole  = req.body.role;

    // 1) Validate
    if (!['ENGINEER','MANAGER'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role. Must be ENGINEER or MANAGER.' });
    }

    // 2) Block self-change
    if (meId === targetId) {
      return res.status(403).json({ message: 'You cannot change your own role.' });
    }

    // 3) Fetch me & target
    const [me, target] = await Promise.all([
      prisma.user.findUnique({ where: { id: meId } }),
      prisma.user.findUnique({ where: { id: targetId } })
    ]);
    if (!target) {
      return res.status(404).json({ message: 'Target user not found.' });
    }

    // 4) Block changing the super-admin (except by super-admin)
    if (target.isSuperAdmin && !me.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot change the super-admin’s role.' });
    }

    // 5) If NOT super-admin, apply all restrictions
    if (!me.isSuperAdmin) {
      // Block promoter
      if (target.id === me.managerId) {
        return res.status(403).json({ message: 'Cannot change your promoter’s role.' });
      }

      // Block changing the super-admin (already handled above, but double safety)
      if (target.isSuperAdmin) {
        return res.status(403).json({ message: 'Cannot change the super-admin’s role.' });
      }

      // Only allow demote if you are the promoter
      if (target.role === 'MANAGER' && newRole === 'ENGINEER' && target.managerId !== meId) {
        return res.status(403).json({ message: 'You can only demote managers you promoted.' });
      }

      // Only allow promote if target is engineer
      if (target.role === 'MANAGER' && newRole === 'MANAGER') {
        return res.status(403).json({ message: 'User is already a manager.' });
      }

      // Only allow promote/demote for engineers or managers you promoted
      if (
        (target.role === 'ENGINEER' && newRole === 'MANAGER') ||
        (target.role === 'MANAGER' && newRole === 'ENGINEER')
      ) {
        // OK, handled above
      } else {
        return res.status(403).json({ message: 'Not allowed.' });
      }
    }

    // 6) Toggle role & update managerId
    let newManagerId = target.managerId;
    if (newRole === 'MANAGER') {
      newManagerId = meId;
    } else if (newRole === 'ENGINEER') {
      newManagerId = meId; // Assign demoted engineer to the acting manager
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data: {
        role: newRole,
        managerId: newManagerId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        isSuperAdmin: true
      }
    });

    // 7) If I just toggled *my own* role, issue a fresh token
    let newToken;
    if (updated.id === meId) {
      const payload = { id: updated.id, role: updated.role };
      if (updated.isSuperAdmin) payload.isSuperAdmin = true;
      newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    }

    // 8) Respond
    return res.json({
      message: `User role changed to ${newRole}.`,
      user: updated,
      ...(newToken && { token: newToken })
    });
  }
);

/**
 * PUT /api/users/:id
 *   • Edit user info
 *   • Super-admin can edit anyone except himself and the super-admin
 *   • Managers can only edit engineers, and only edit managers they promoted, and can edit themselves
 *   • Managers cannot edit their promoter or the super-admin
 */
router.put(
  '/:id',
  authenticate,
  authorizeRole('MANAGER'),
  async (req, res) => {
    const meId     = req.user.id;
    const targetId = parseInt(req.params.id, 10);
    const { name, email, password, skills, maxCapacity, firstName, lastName, department } = req.body;

    // 1) Fetch me & target
    const [me, target] = await Promise.all([
      prisma.user.findUnique({ where: { id: meId } }),
      prisma.user.findUnique({ where: { id: targetId } })
    ]);
    if (!target) return res.status(404).json({ message: 'User not found.' });

    // 2) Block editing the super-admin (except by super-admin)
    if (target.isSuperAdmin && !me.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot edit the super-admin.' });
    }

    // 3) If NOT super-admin, apply all restrictions
    if (!me.isSuperAdmin) {
      // Block promoter
      if (target.id === me.managerId) {
        return res.status(403).json({ message: 'Cannot edit your promoter.' });
      }

      // Block editing the super-admin (already handled above, but double safety)
      if (target.isSuperAdmin) {
        return res.status(403).json({ message: 'Cannot edit the super-admin.' });
      }

      // Only allow edit for self, engineers, or managers you promoted
      if (
        target.id === me.id ||
        target.role === 'ENGINEER' ||
        (target.role === 'MANAGER' && target.managerId === me.id)
      ) {
        // OK
      } else {
        return res.status(403).json({ message: 'Not allowed.' });
      }
    }

    let data = { name, email, skills, maxCapacity, firstName, lastName, department };
   
    if (firstName !== undefined || lastName !== undefined) {
      const newFirst = firstName !== undefined ? firstName : target.firstName || "";
      const newLast = lastName !== undefined ? lastName : target.lastName || "";
      data.name = `${newFirst} ${newLast}`.trim();
    }
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: targetId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        managerId: true,
        isSuperAdmin: true,
        skills: true,
        maxCapacity: true,
        firstName: true,
        lastName: true,
        department: true
      }
    });

    return res.json({ message: 'User updated.', user: updated });
  }
);

/**
 * DELETE /api/users/:id
 *   • Delete user
 *   • Super-admin can delete anyone except himself and the super-admin
 *   • Managers can only delete engineers, and only delete managers they promoted
 *   • Managers cannot delete their promoter or the super-admin or themselves
 */
router.delete(
  '/:id',
  authenticate,
  authorizeRole('MANAGER'),
  async (req, res) => {
    const meId     = req.user.id;
    const targetId = parseInt(req.params.id, 10);

    // 1) Fetch me & target
    const [me, target] = await Promise.all([
      prisma.user.findUnique({ where: { id: meId } }),
      prisma.user.findUnique({ where: { id: targetId } })
    ]);
    if (!target) return res.status(404).json({ message: 'User not found.' });

    // 2) Block deleting the super-admin (except by super-admin)
    if (target.isSuperAdmin && !me.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot delete the super-admin.' });
    }

    // 3) If NOT super-admin, apply all restrictions
    if (!me.isSuperAdmin) {
      // Block promoter
      if (target.id === me.managerId) {
        return res.status(403).json({ message: 'Cannot delete your promoter.' });
      }

      // Block deleting the super-admin (already handled above, but double safety)
      if (target.isSuperAdmin) {
        return res.status(403).json({ message: 'Cannot delete the super-admin.' });
      }

      // Only allow delete for engineers or managers you promoted
      if (
        target.role === 'ENGINEER' ||
        (target.role === 'MANAGER' && target.managerId === me.id)
      ) {
        // OK
      } else {
        return res.status(403).json({ message: 'Not allowed.' });
      }
    }

    await prisma.user.delete({ where: { id: targetId } });
    return res.json({ message: 'User deleted.' });
  }
);

// Change password for current user
router.post(
  '/me/change-password',
  authenticate,
  async (req, res) => {
    const id = req.user.id;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { password: hashed, lastPasswordChange: new Date() }
    });
    res.json({ message: 'Password updated successfully.' });
  }
);

module.exports = router;
