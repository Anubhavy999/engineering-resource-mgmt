const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : ["http://localhost:5173"];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());



const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const projectRoutes = require('./routes/project');
app.use('/api/projects', projectRoutes);

const assignmentRoutes = require('./routes/assignment');
app.use('/api/assignments', assignmentRoutes);

const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

const notificationsRouter = require('./routes/notifications');
app.use('/api/notifications', notificationsRouter);

app.use('/api/users', require('./routes/user'));

const managerRoutes = require('./routes/manager');
app.use('/api/manager', managerRoutes);



app.get('/', (req, res) => {
  res.send('API is running');
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
