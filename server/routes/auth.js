// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Register
router.post('/register', async (req, res) => {
    // Only allow new users to register as ENGINEER
    const { firstName, lastName, email, password, department, skills, maxCapacity } = req.body;
    const name = (firstName || lastName) ? `${firstName || ''} ${lastName || ''}`.trim() : req.body.name;
    const role = 'ENGINEER'; // Force new registrations to be 'ENGINEER'

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                firstName: firstName || null,
                lastName: lastName || null,
                email,
                password: hashedPassword,
                role,
                skills: skills || null,
                maxCapacity: maxCapacity !== undefined ? maxCapacity : 100,
                department: department || null
            },
        });

        res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (err) {
        console.error("Register error:", err);
        res.status(500).json({ error: err.message || 'Server error during registration.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

        // Update lastLogin on successful login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // Fetch latest stats
        const freshUser = await prisma.user.findUnique({ where: { id: user.id } });
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

        // Update performance
        console.log("Updating performance for user", user.id, "to", performance);
        await prisma.user.update({
            where: { id: user.id },
            data: { performance }
        });
        console.log("Performance updated!");

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Include user.id in the response
        res.status(200).json({ token, role: user.role, name: user.name, id: user.id, email: user.email });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: err.message || 'Server error during login.' });
    }
});

module.exports = router;