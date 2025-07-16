// prisma/seed.js
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

  console.log('🌱 Seed data created!');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
