import React, { useEffect, useState } from "react";
import axios from "axios";

export default function EngineerDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/assignments?userId=me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAssignments(res.data);
      } catch (err) {
        setError("Failed to load your assignments.");
        console.error(err);
      }
    };

    fetchAssignments();
  }, []);

  // Calculate remaining capacity
  const used = assignments.reduce((sum, a) => sum + a.allocation, 0);
  const remaining = 100 - used;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Dashboard</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-700">Current Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-gray-600 mt-2">You have no assignments currently.</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-200">
            {assignments.map((a, idx) => (
              <li key={idx} className="flex justify-between py-2">
                <span>{a.project.name}</span>
                <span className="text-gray-600">{a.allocation}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold text-gray-700">Remaining Capacity</h2>
        <p className="text-xl font-bold mt-2">{remaining}% available</p>
      </div>
    </div>
  );
}
