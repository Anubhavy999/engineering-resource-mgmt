const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Ensure Shyam is super admin
  await prisma.user.upsert({
    where: { email: 'shyam@gmail.com' },
    update: { isSuperAdmin: true },
    create: {
      name: 'Shyam',
      email: 'shyam@gmail.com',
      password: '$2b$10$efCx6KY96zN0BRo8O3yPFuWcxUmC5kY6PNJNJ1ofQxfBvN9n10AiW', // hashed "password"
      role: 'MANAGER',
      isSuperAdmin: true,
      firstName: 'Shyam',
      lastName: 'Jha',
      phone: '+91 9876543210',
      bio: 'Super Admin and Manager',
      avatarUrl: null,
      country: 'India',
      city: 'Delhi',
      postalCode: '110001',
      taxId: 'IN123456',
      lastLogin: new Date(),
      projectsAssigned: 2,
      tasksCompleted: 10,
      performance: 'Excellent',
      lastPasswordChange: new Date()
    },
  });

  
  // Create engineers if not exist
  const alice = await prisma.user.upsert({
    where: { email: 'alice@gmail.com' },
    update: {},
    create: {
      name: 'Alice Dev',
      email: 'alice@gmail.com',
      password: '$2b$10$ozX.2AjzcAta2K3HgVbbieTwfBzvvq/cYIFwacD5DRwMi.L7AetD.', // hashed "password"
      role: 'ENGINEER',
      skills: 'Node,React',
      maxCapacity: 100,
      firstName: 'Alice',
      lastName: 'Dev',
      phone: '+1 555-1234',
      bio: 'Frontend Engineer',
      avatarUrl: null,
      country: 'USA',
      city: 'San Francisco',
      postalCode: '94105',
      taxId: 'US987654',
      lastLogin: new Date(),
      projectsAssigned: 1,
      tasksCompleted: 5,
      performance: 'Good',
      lastPasswordChange: new Date()
    },
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@gmail.com' },
    update: {},
    create: {
      name: 'Bob Dev',
      email: 'bob@gmail.com',
      password: '$2b$10$KpG6NMNv9gu1lnE4YG4dxu2.ppzf3yaR3hhNb1rH7eIdSs.1sYYXu', // hashed "password"
      role: 'ENGINEER',
      skills: 'SQL,Java',
      maxCapacity: 80,
      firstName: 'Bob',
      lastName: 'Dev',
      phone: '+1 555-5678',
      bio: 'Backend Engineer',
      avatarUrl: null,
      country: 'USA',
      city: 'New York',
      postalCode: '10001',
      taxId: 'US123789',
      lastLogin: new Date(),
      projectsAssigned: 1,
      tasksCompleted: 3,
      performance: 'Average',
      lastPasswordChange: new Date()
    },
  });

  const carol = await prisma.user.upsert({
    where: { email: 'carol@gmail.com' },
    update: {},
    create: {
      name: 'Carol Smith',
      email: 'carol@gmail.com',
      password: '$2b$10$w1Qw8Qw8Qw8Qw8Qw8Qw8QeQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8', // hashed "password"
      role: 'ENGINEER',
      skills: 'Python,React',
      maxCapacity: 50,
      firstName: 'Carol',
      lastName: 'Smith',
      phone: '+1 555-9012',
      bio: 'Data Engineer',
      avatarUrl: null,
      country: 'USA',
      city: 'Austin',
      postalCode: '73301',
      taxId: 'US456123',
      lastLogin: new Date(),
      projectsAssigned: 2,
      tasksCompleted: 4,
      performance: 'Good',
      lastPasswordChange: new Date()
    },
  });

  const dave = await prisma.user.upsert({
    where: { email: 'dave@gmail.com' },
    update: {},
    create: {
      name: 'Dave Lee',
      email: 'dave@gmail.com',
      password: '$2b$10$w2Qw8Qw8Qw8Qw8Qw8Qw8QeQw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8Qw8', // hashed "password"
      role: 'ENGINEER',
      skills: 'Node,Go',
      maxCapacity: 100,
      firstName: 'Dave',
      lastName: 'Lee',
      phone: '+1 555-3456',
      bio: 'Fullstack Engineer',
      avatarUrl: null,
      country: 'USA',
      city: 'Seattle',
      postalCode: '98101',
      taxId: 'US654321',
      lastLogin: new Date(),
      projectsAssigned: 1,
      tasksCompleted: 2,
      performance: 'Average',
      lastPasswordChange: new Date()
    },
  });


  // Create Projects
  const project1 = await prisma.project.upsert({
    where: { name: 'CRM App' },
    update: {},
    create: {
      name: 'CRM App',
      description: 'Customer Management System',
      requiredSkills: 'Node,SQL',
      teamSize: 3,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // in ~60 days
      createdById: alice.role === 'MANAGER' ? alice.id : bob.id // or Shyam.id if you prefer
    },
  });
 
  const project2 = await prisma.project.upsert({
    where: { name: 'Analytics Platform' },
    update: {},
    create: {
      name: 'Analytics Platform',
      description: 'Big data analytics and reporting',
      requiredSkills: 'Python,React',
      teamSize: 4,
      status: 'PLANNING',
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), // in 10 days
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 90), // in 90 days
      createdById: 1 // Shyam (manager)
    },
  });

  const project3 = await prisma.project.upsert({
    where: { name: 'Mobile App' },
    update: {},
    create: {
      name: 'Mobile App',
      description: 'Cross-platform mobile application',
      requiredSkills: 'React,Java',
      teamSize: 3,
      status: 'ACTIVE',
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20), // started 20 days ago
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 40), // in 40 days
      createdById: 1 // Shyam (manager)
    },
  });

  const project4 = await prisma.project.upsert({
    where: { name: 'DevOps Automation' },
    update: {},
    create: {
      name: 'DevOps Automation',
      description: 'CI/CD and infrastructure automation',
      requiredSkills: 'Go,Node',
      teamSize: 2,
      status: 'PLANNING',
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // in 30 days
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120), // in 120 days
      createdById: 1 // Shyam (manager)
    },
  });


  // Assign Engineers
  await prisma.assignment.createMany({
    data: [
      {
        userId: alice.id,
        projectId: project1.id,
        allocation: 50,
      },
      {
        userId: bob.id,
        projectId: project1.id,
        allocation: 40,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.assignment.createMany({
    data: [
      {
        userId: carol.id,
        projectId: project2.id,
        allocation: 40,
      },
      {
        userId: alice.id,
        projectId: project2.id,
        allocation: 30,
      },
      // New assignments for project3
      {
        userId: bob.id,
        projectId: project3.id,
        allocation: 60,
      },
      {
        userId: dave.id,
        projectId: project3.id,
        allocation: 50,
      },
      // New assignments for project4
      {
        userId: dave.id,
        projectId: project4.id,
        allocation: 70,
      },
      {
        userId: carol.id,
        projectId: project4.id,
        allocation: 30,
      },
      {
        userId: alice.id,
        projectId: project4.id,
        allocation: 20,
      },
    ],
    skipDuplicates: true,
  });

  // Add tasks to projects
  const task1 = await prisma.task.upsert({
    where: { title: 'Design Database Schema' },
    update: {},
    create: {
      title: 'Design Database Schema',
      description: 'Create and optimize the database schema for CRM App',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      projectId: project1.id,
      assignedToId: alice.id,
    },
  });
  const task2 = await prisma.task.upsert({
    where: { title: 'Implement Authentication' },
    update: {},
    create: {
      title: 'Implement Authentication',
      description: 'Add JWT-based authentication to CRM App',
      status: 'PENDING',
      priority: 'MEDIUM',
      projectId: project1.id,
      assignedToId: bob.id,
    },
  });
  const task3 = await prisma.task.upsert({
    where: { title: 'Build Analytics Dashboard' },
    update: {},
    create: {
      title: 'Build Analytics Dashboard',
      description: 'Develop dashboard for Analytics Platform',
      status: 'PENDING',
      priority: 'HIGH',
      projectId: project2.id,
      assignedToId: carol.id,
    },
  });
  const task4 = await prisma.task.upsert({
    where: { title: 'Integrate Data Sources' },
    update: {},
    create: {
      title: 'Integrate Data Sources',
      description: 'Connect various data sources to Analytics Platform',
      status: 'PENDING',
      priority: 'MEDIUM',
      projectId: project2.id,
      assignedToId: alice.id,
    },
  });
  const task5 = await prisma.task.upsert({
    where: { title: 'Develop Mobile UI' },
    update: {},
    create: {
      title: 'Develop Mobile UI',
      description: 'Create UI for Mobile App',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      projectId: project3.id,
      assignedToId: bob.id,
    },
  });
  const task6 = await prisma.task.upsert({
    where: { title: 'Setup CI/CD Pipeline' },
    update: {},
    create: {
      title: 'Setup CI/CD Pipeline',
      description: 'Automate deployment for DevOps Automation',
      status: 'PENDING',
      priority: 'HIGH',
      projectId: project4.id,
      assignedToId: dave.id,
    },
  });

  // Link assignments to tasks (where possible)
  await prisma.assignment.updateMany({
    where: { userId: alice.id, projectId: project1.id },
    data: { taskId: task1.id, role: 'Database Designer' },
  });
  await prisma.assignment.updateMany({
    where: { userId: bob.id, projectId: project1.id },
    data: { taskId: task2.id, role: 'Backend Developer' },
  });
  await prisma.assignment.updateMany({
    where: { userId: carol.id, projectId: project2.id },
    data: { taskId: task3.id, role: 'Data Engineer' },
  });
  await prisma.assignment.updateMany({
    where: { userId: alice.id, projectId: project2.id },
    data: { taskId: task4.id, role: 'Integrator' },
  });
  await prisma.assignment.updateMany({
    where: { userId: bob.id, projectId: project3.id },
    data: { taskId: task5.id, role: 'Mobile UI Developer' },
  });
  await prisma.assignment.updateMany({
    where: { userId: dave.id, projectId: project4.id },
    data: { taskId: task6.id, role: 'DevOps Engineer' },
  });

  console.log('🌱 Seed data created!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
