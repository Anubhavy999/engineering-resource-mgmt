const express = require("express");
const pool = require("../config/db");
const router = express.Router();


router.get("/summary", async (req, res) => {
  try {
    const totalEngRes = await pool.query(
      "SELECT COUNT(*) FROM \"User\" WHERE role = 'ENGINEER'"
    );
    const totalProjRes = await pool.query(
      "SELECT COUNT(*) FROM \"Project\""
    );
    // total allocated capacity per engineer
    const allocByEng = await pool.query(`
      SELECT u.id, u.name,
        COALESCE(100 - SUM(a.allocation), 100) AS remaining_capacity
      FROM "User" u
      LEFT JOIN "Assignment" a
        ON a."userId" = u.id
      WHERE u.role = 'ENGINEER'
      GROUP BY u.id, u.name
    `);
    const remainingCapacity = allocByEng.rows.reduce(
      (sum, r) => sum + parseFloat(r.remaining_capacity),
      0
    );
    // underutilized (remaining ≥ 30%)
    const underutilized = allocByEng.rows
      .filter((r) => parseFloat(r.remaining_capacity) >= 30)
      .map((r) => ({
        name: r.name,
        capacity: parseFloat(r.remaining_capacity),
      }));

    res.json({
      engineers: parseInt(totalEngRes.rows[0].count, 10),
      projects: parseInt(totalProjRes.rows[0].count, 10),
      capacityAvailable: remainingCapacity,
      underutilized,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error retrieving summary" });
  }
});

module.exports = router;
