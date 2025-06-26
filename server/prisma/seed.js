const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create Manager
  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      name: 'Shyam',
      email: 'shyam@example.com',
      password: '$2b$10$efCx6KY96zN0BRo8O3yPFuWcxUmC5kY6PNJNJ1ofQxfBvN9n10AiW', // bcrypt-hashed "password"
      role: 'MANAGER'
    }
  });

  // Create Engineers
  const engineers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Alice Dev',
        email: 'alice@example.com',
        password: '$2b$10$ozX.2AjzcAta2K3HgVbbieTwfBzvvq/cYIFwacD5DRwMi.L7AetD.',
        role: 'ENGINEER',
        skills: 'Node,React',
        seniority: 'Senior',
        maxCapacity: 100,
        department: 'Engineering',
        employmentType: 'FULL_TIME'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Bob Dev',
        email: 'bob@example.com',
        password: '$2b$10$KpG6NMNv9gu1lnE4YG4dxu2.ppzf3yaR3hhNb1rH7eIdSs.1sYYXu',
        role: 'ENGINEER',
        skills: 'SQL,Java',
        seniority: 'Mid',
        maxCapacity: 80,
        department: 'Backend',
        employmentType: 'CONTRACT'
      }
    }),
  ]);

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'CRM App',
      description: 'Customer Management System',
      requiredSkills: 'Node,SQL',
      teamSize: 3,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
      createdById: manager.id
    }
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Internal Dashboard',
      requiredSkills: 'React',
      teamSize: 2,
      status: 'PLANNING',
      createdById: manager.id
    }
  });

  // Assign Engineers
  await prisma.assignment.createMany({
    data: [
      {
        userId: engineers[0].id,
        projectId: project1.id,
        role: 'Fullstack Dev',
        allocation: 50,
      },
      {
        userId: engineers[1].id,
        projectId: project1.id,
        role: 'DB Engineer',
        allocation: 40,
      },
    ]
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
