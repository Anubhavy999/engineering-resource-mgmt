const express = require("express");
const router = express.Router();
const prisma = require("../prisma/client");

router.get("/summary", async (req, res) => {
  try {
    // Count engineers
    const engineersCount = await prisma.user.count({ where: { role: "ENGINEER" } });

    // Count projects
    const projectsCount = await prisma.project.count();

    // Get all engineers
    const engineers = await prisma.user.findMany({
      where: { role: "ENGINEER" },
      select: { id: true, name: true, maxCapacity: true },
    });

    // Aggregate allocations per engineer
    const allocations = await prisma.assignment.groupBy({
      by: ["userId"],
      _sum: { allocation: true },
    });
    const userIdToAllocated = new Map(
      allocations.map((a) => [a.userId, a._sum.allocation || 0])
    );

    const engineerCapacities = engineers.map((eng) => {
      const max = typeof eng.maxCapacity === "number" ? eng.maxCapacity : 100;
      const allocated = userIdToAllocated.get(eng.id) || 0;
      const remaining = Math.max(0, max - allocated);
      return { id: eng.id, name: eng.name, remaining };
    });

    const totalRemainingCapacity = engineerCapacities.reduce((sum, e) => sum + e.remaining, 0);

    const underutilized = engineerCapacities
      .filter((e) => e.remaining >= 30)
      .map((e) => ({ name: e.name, capacity: e.remaining }));

    res.json({
      engineers: engineersCount,
      projects: projectsCount,
      capacityAvailable: totalRemainingCapacity,
      underutilized,
    });
  } catch (err) {
    console.error("Manager summary error:", err);
    res.status(500).json({ message: "Server error retrieving summary" });
  }
});

module.exports = router;
