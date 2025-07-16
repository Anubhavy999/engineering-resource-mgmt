import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../services/api";

const EngineerAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState("project.name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);

  const removedClosedProjects = JSON.parse(localStorage.getItem("removedClosedProjects") || "[]");

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      setError("");
      try {
        console.log("Fetching assignments...");
        const token = sessionStorage.getItem("token");
        console.log("Token exists:", !!token);
        
        // ✅ FIXED: Use the correct endpoint
        const res = await api.get("/assignments");
        
        console.log("Assignments response:", res.data);
        
        // Filter out assignments for removed closed projects
        const filtered = res.data.filter(
          (a) => !removedClosedProjects.includes(a.projectId)
        );
        
        console.log("Filtered assignments:", filtered);
        setAssignments(filtered);
      } catch (err) {
        console.error("Error fetching assignments:", err);
        console.error("Error response:", err.response?.data);
        setError(`Failed to fetch assignments: ${err.response?.data?.message || err.message}`);
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const exportToPDF = () => {
    if (sortedAssignments.length === 0) {
      alert("No assignments to export!");
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text("My Assignments Report", 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);
    
    // Prepare data for table
    const filteredData = sortedAssignments.map((item) => [
      // Project name + team members
      `${item.project?.name || "N/A"}\n\nProject Members: ${getTeamMembers(item.project).map(u => u.name).join(", ")}`,
      // Task title + same task engineers
      `${item.task?.title || "No specific task"}${getSameTaskEngineers(item.project, item.task).length > 0 ? `\n\nTask With: ${getSameTaskEngineers(item.project, item.task).map(u => u.name).join(", ")}` : ""}`,
      `${item.allocation}%`,
      getTaskStatus(item.task),
      getTaskPriority(item.task),
      getTaskDescription(item.task)
    ]);

    autoTable(doc, {
      head: [["Project", "Task", "Allocation", "Status", "Priority", "Description"]],
      body: filteredData,
      startY: 40,
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 'auto' },
      },
      didDrawPage: function (data) {
        doc.setFontSize(10);
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      },
    });
    
    doc.save("assignments-report.pdf");
  };

  // Helper functions for task details
  const getTaskStatus = (task) => {
    if (!task) return "N/A";
    switch (task.status) {
      case "COMPLETED":
        return "Completed";
      case "IN_PROGRESS":
        return "In Progress";
      case "PENDING":
        return "Pending";
      default:
        return task.status || "N/A";
    }
  };

  const getTaskPriority = (task) => {
    if (!task) return "N/A";
    switch (task.priority) {
      case "HIGH":
        return "High";
      case "MEDIUM":
        return "Medium";
      case "LOW":
        return "Low";
      default:
        return task.priority || "N/A";
    }
  };

  const getTaskDescription = (task) => {
    if (!task || !task.description) return "No description available";
    return task.description.length > 50 
      ? task.description.substring(0, 50) + "..." 
      : task.description;
  };

  // Get current user ID from session
  const currentUserId = Number(sessionStorage.getItem("id"));

  // Helper to get team members for a project
  const getTeamMembers = (project) => {
    if (!project?.assignments) return [];
    // Unique users by id
    const seen = new Set();
    return project.assignments
      .map(a => a.user)
      .filter(u => u && !seen.has(u.id) && seen.add(u.id));
  };

  // Helper to get engineers assigned to the same task
  const getSameTaskEngineers = (project, task) => {
    if (!project?.assignments || !task) return [];
    return project.assignments
      .filter(a => a.taskId === task.id && a.user && a.user.id !== currentUserId)
      .map(a => a.user);
  };

  const filteredAssignments = assignments.filter((a) =>
    a.project?.name?.toLowerCase().includes(filter.toLowerCase())
  );

  const sortedAssignments = [...filteredAssignments].sort((a, b) => {
    let aValue, bValue;

    switch (sortKey) {
      case "project.name":
        aValue = a.project?.name || "";
        bValue = b.project?.name || "";
        break;
      case "allocation":
        aValue = a.allocation || 0;
        bValue = b.allocation || 0;
        break;
      case "task.status":
        aValue = a.task?.status || "";
        bValue = b.task?.status || "";
        break;
      case "task.priority":
        aValue = a.task?.priority || "";
        bValue = b.task?.priority || "";
        break;
      default:
        aValue = a.project?.name || "";
        bValue = b.project?.name || "";
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading assignments...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          {/* Optionally add an icon here for visual flair */}
          My Assignments
        </h1>
        <button
          onClick={exportToPDF}
          disabled={sortedAssignments.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export to PDF
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by project name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-300 border-t-4 border-blue-100 hover:shadow-2xl hover:scale-[1.01] hover:border-blue-400">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => handleSort("project.name")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    Project
                    {sortKey === "project.name" && (
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d={sortOrder === "asc" ? "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" : "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"} clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task
              </th>
              <th
                onClick={() => handleSort("allocation")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    Allocation
                    {sortKey === "allocation" && (
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d={sortOrder === "asc" ? "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" : "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"} clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("task.status")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    Status
                    {sortKey === "task.status" && (
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d={sortOrder === "asc" ? "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" : "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"} clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("task.priority")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    Priority
                    {sortKey === "task.priority" && (
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d={sortOrder === "asc" ? "M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" : "M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"} clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
              </th>
            </tr>
          </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {sortedAssignments.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-shadow duration-200 hover:shadow-lg">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.project?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Project Members: {getTeamMembers(item.project).map(u => u.name).join(", ") || "N/A"}
                    </div>
                    {getSameTaskEngineers(item.project, item.task).length > 0 && (
                      <div className="text-xs text-blue-600 mt-1">
                        Task With: {getSameTaskEngineers(item.project, item.task).map(u => u.name).join(", ")}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.task?.title || "No specific task"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.allocation}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.task?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      item.task?.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.task?.status || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.task?.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                      item.task?.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.task?.priority || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 space-y-1">
                      <div className="flex items-center">
                        <span className="font-medium">Status:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          item.task?.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          item.task?.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.task?.status || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Priority:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          item.task?.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          item.task?.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.task?.priority || 'N/A'}
                        </span>
                      </div>
                      {item.task?.completionRequested && (
                        <div className="flex items-center">
                          <span className="font-medium">Completion:</span>
                          <span className="ml-2 px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            Requested
                          </span>
                        </div>
                      )}
                      {item.task?.description && (
                        <div className="text-xs text-gray-600 mt-1">
                          <span className="font-medium">Description:</span>
                          <p className="mt-1">{item.task.description}</p>
                        </div>
                      )}
                    </div>
                  </td>
              </tr>
            ))}
              {sortedAssignments.length === 0 && !error && (
              <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No assignments available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

export default EngineerAssignments;
