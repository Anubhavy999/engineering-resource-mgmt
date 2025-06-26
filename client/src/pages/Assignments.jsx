import React, { useEffect, useState } from "react";
import axios from "axios";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/assignments", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setAssignments(res.data);
      } catch (err) {
        setError("Failed to fetch assignments.");
        console.error(err);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Engineer Assignments</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Engineer</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Project</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Allocation (%)</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-800">{item.engineer?.name}</td>
                <td className="px-6 py-4 text-gray-800">{item.project?.name}</td>
                <td className="px-6 py-4 text-gray-800">{item.allocation}%</td>
              </tr>
            ))}
            {assignments.length === 0 && !error && (
              <tr>
                <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                  No assignments available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assignments;
