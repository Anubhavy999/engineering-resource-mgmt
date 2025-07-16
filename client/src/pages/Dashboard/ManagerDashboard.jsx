import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../services/api";

// Example icons (replace with your own or a library like react-icons)
const EngineerIcon = () => (
  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
  </svg>
);
const ProjectIcon = () => (
  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M16 3v4M8 3v4" />
  </svg>
);
const CapacityIcon = () => (
  <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

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
        const res = await api.get("/manager/summary", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
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
    <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* Dashboard Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of engineering resources and project capacity</p>
        </div>
        {error && <span className="text-red-600 font-medium mt-4 md:mt-0">{error}</span>}
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
        <div className="flex items-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-blue-200 hover:border-blue-400 group cursor-pointer">
          <EngineerIcon />
          <div className="ml-4">
            <div className="text-gray-500 text-xs uppercase tracking-wide">Total Engineers</div>
            <div className="text-2xl font-bold text-gray-800">{summary.engineers}</div>
          </div>
        </div>
        <div className="flex items-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-green-200 hover:border-green-400 group cursor-pointer">
          <ProjectIcon />
          <div className="ml-4">
            <div className="text-gray-500 text-xs uppercase tracking-wide">Total Projects</div>
            <div className="text-2xl font-bold text-gray-800">{summary.projects}</div>
          </div>
        </div>
        <div className="flex items-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all border-t-4 border-yellow-200 hover:border-yellow-400 group cursor-pointer">
          <CapacityIcon />
          <div className="ml-4">
            <div className="text-gray-500 text-xs uppercase tracking-wide">Capacity Available</div>
            <div className="text-2xl font-bold text-gray-800">{summary.capacityAvailable}%</div>
          </div>
        </div>
      </section>

      {/* Underutilized Engineers */}
      <section className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-indigo-100 hover:shadow-2xl transition-shadow mt-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
            <path d="M6.343 17.657A8 8 0 0 1 12 16a8 8 0 0 1 5.657 1.657" />
          </svg>
          Underutilized Engineers
        </h2>
        {summary.underutilized.length === 0 ? (
          <div className="flex items-center text-green-700 bg-gradient-to-r from-green-100 to-green-50 rounded-lg p-5 shadow-sm">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">All engineers are well utilized.</span>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {summary.underutilized.map((eng, idx) => (
              <li key={idx} className="py-4 flex justify-between items-center hover:bg-indigo-50 rounded-lg transition-all">
                <span className="font-semibold text-gray-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" /></svg>
                  {eng.name}
                </span>
                <span className="text-sm text-indigo-700 font-medium">{eng.capacity}% free</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default ManagerDashboard;
