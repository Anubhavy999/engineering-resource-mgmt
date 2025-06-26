import React, { useEffect, useState } from "react";
import axios from "axios";

const ManagerDashboard = () => {
  const [summary, setSummary] = useState({
    engineers: 0,
    projects: 0,
    capacityAvailable: 0,
    underutilized: [],
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/manager/summary", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSummary(res.data);
      } catch (err) {
        setError("Failed to fetch summary.");
        console.error(err);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manager Dashboard</h1>

      {error && <p className="text-red-600">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-sm text-gray-500">Total Engineers</h2>
          <p className="text-xl font-semibold">{summary.engineers}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-sm text-gray-500">Total Projects</h2>
          <p className="text-xl font-semibold">{summary.projects}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-sm text-gray-500">Total Capacity Available</h2>
          <p className="text-xl font-semibold">{summary.capacityAvailable}%</p>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          Underutilized Engineers
        </h3>
        {summary.underutilized.length === 0 ? (
          <p className="text-sm text-gray-500">All engineers are well utilized.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {summary.underutilized.map((eng, idx) => (
              <li key={idx} className="py-2 flex justify-between">
                <span>{eng.name}</span>
                <span className="text-sm text-gray-600">{eng.capacity}% free</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
