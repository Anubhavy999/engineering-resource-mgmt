import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { FaTasks, FaBatteryHalf, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';

const EngineerDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const [engineerName, setEngineerName] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get("/assignments?userId=me");
        setAssignments(res.data);
      } catch (err) {
        setError("Failed to load your assignments.");
        console.error(err);
      }
    };

    const fetchName = () => {
      const name = sessionStorage.getItem("name");
      if (name) setEngineerName(name);
    };

    fetchAssignments();
    fetchName();
  }, []);

  // Calculate remaining capacity
  const used = assignments.reduce((sum, a) => sum + a.allocation, 0);
  const remaining = 100 - used;

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Dashboard Header */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Engineer Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your assignments and capacity</p>
        </div>
        {error && <span className="text-red-600 font-medium mt-4 md:mt-0">{error}</span>}
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
        <div className="flex items-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-blue-200 hover:border-blue-400 group cursor-pointer">
          <FaTasks className="w-6 h-6 text-blue-500" />
          <div className="ml-4">
            <div className="text-gray-500 text-xs uppercase tracking-wide">Assignments</div>
            <div className="text-2xl font-bold text-gray-800">{assignments.length}</div>
          </div>
        </div>
        <div className="flex items-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-green-200 hover:border-green-400 group cursor-pointer">
          <FaBatteryHalf className="w-6 h-6 text-green-500" />
          <div className="ml-4">
            <div className="text-gray-500 text-xs uppercase tracking-wide">Capacity Available</div>
            <div className="text-2xl font-bold text-gray-800">{remaining}%</div>
          </div>
        </div>
      </section>

      {/* Assignment Details */}
      <section className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-indigo-100 hover:shadow-2xl transition-shadow mb-12">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
          <FaTasks className="w-6 h-6 mr-2 text-indigo-500" />
          Your Assignments
        </h2>
          {assignments.length === 0 ? (
          <div className="flex items-center text-green-700 bg-gradient-to-r from-green-100 to-green-50 rounded-lg p-5 shadow-sm">
            <FaCheckCircle className="w-5 h-5 mr-2 text-green-500" />
            <span className="text-sm font-medium">No current assignments.</span>
          </div>
          ) : (
          <ul className="divide-y divide-gray-100">
              {assignments.map((a, idx) => (
              <li key={idx} className="py-4 flex flex-col md:flex-row md:justify-between items-center hover:bg-indigo-50 rounded-lg transition-all">
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaTasks className="w-4 h-4 text-indigo-400" />
                  {a.project?.name}
                  {a.task?.title && (
                    <span className="ml-2 text-xs text-blue-600">(Task: {a.task.title})</span>
                  )}
                </span>
                <span className="text-indigo-700 text-sm mt-1 md:mt-0 font-medium">{a.allocation}%</span>
                </li>
              ))}
            </ul>
          )}
      </section>

      {/* Quick Info */}
      <section className="rounded-2xl shadow-lg p-8 border-t-4 border-blue-200 hover:shadow-2xl transition-shadow bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FaInfoCircle className="w-5 h-5 text-white/80" />
          Quick Info
        </h3>
        <ul className="text-sm space-y-2">
          <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-white/70 rounded-full"></span> You can view your assigned projects in the "Projects" tab</li>
          <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-white/70 rounded-full"></span> You can view your allocations in the "Assignments" tab</li>
          <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 bg-white/70 rounded-full"></span> Managers manage engineers, assignments, and all projects.</li>
        </ul>
      </section>
    </div>
  );
};

export default EngineerDashboard;
