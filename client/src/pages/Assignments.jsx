import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal } from "../components/ui/modal/index";
import Button from "../components/ui/button/Button";
import api from "../services/api";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ userId: "", projectId: "", taskId: "", allocation: "" });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [unassignId, setUnassignId] = useState(null);

  const fetchData = async () => {
    try {
      const [assignRes, engRes, projRes] = await Promise.all([
        api.get("/assignments"),
        api.get("/users/engineers"),
        api.get("/projects"),
      ]);
      setAssignments(assignRes.data);
      setEngineers(engRes.data);
      setProjects(projRes.data);
    } catch (err) {
      setError("Failed to load data.");
      console.error(err);
    }
  };

  // Fetch tasks for the selected project
  useEffect(() => {
    if (form.projectId) {
      api
        .get(`/projects/${form.projectId}`)
        .then((res) => {
          setTasks(res.data.tasks || []);
        })
        .catch(() => setTasks([]));
    } else {
      setTasks([]);
    }
    setForm((prev) => ({ ...prev, taskId: "" })); // Reset taskId when project changes
    // eslint-disable-next-line
  }, [form.projectId]);

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/assignments", form);
      setMessage("Engineer assigned successfully.");
      setForm({ userId: "", projectId: "", taskId: "", allocation: "" });
      setTasks([]);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Assignment failed");
      console.error(err);
    }
  };

  const handleUnassign = async (id) => {
    setUnassignId(id);
    setShowUnassignModal(true);
  };

  const confirmUnassign = async () => {
    setShowUnassignModal(false);
    if (!unassignId) return;
    try {
      await api.delete(`/assignments/${unassignId}`);
      setMessage("Engineer unassigned successfully.");
      fetchData();
    } catch (err) {
      setError("Failed to unassign engineer.");
      console.error(err);
    } finally {
      setUnassignId(null);
    }
  };

  const closeUnassignModal = () => {
    setShowUnassignModal(false);
    setUnassignId(null);
  };

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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Engineer Assignments</h1>

      {error && <p className="text-red-600 mb-4 text-lg font-medium animate-pulse">{error}</p>}
      {message && <p className="text-green-600 mb-4 text-lg font-medium animate-pulse">{message}</p>}

      {/* Assignment Form Card with hover effect */}
      <form
        onSubmit={handleAssign}
        className="mb-10 bg-white p-6 shadow-lg rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-6 transition-all duration-300 border-t-4 border-blue-100 hover:shadow-2xl hover:scale-[1.015] hover:border-blue-400"
      >
        <select
          value={form.userId}
          onChange={(e) => setForm({ ...form, userId: parseInt(e.target.value) })}
          required
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 text-base"
        >
          <option value="">Select Engineer</option>
          {engineers.map((eng) => (
            <option key={eng.id} value={eng.id}>
              {eng.name}
            </option>
          ))}
        </select>

        <select
          value={form.projectId}
          onChange={(e) => setForm({ ...form, projectId: parseInt(e.target.value) })}
          required
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 text-base"
        >
          <option value="">Select Project</option>
          {projects
            .filter((proj) => !proj.isClosed) // Only show open projects
            .map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
        </select>

        {/* Select Task Dropdown */}
        <select
          value={form.taskId}
          onChange={(e) => setForm({ ...form, taskId: parseInt(e.target.value) })}
          required
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 text-base"
          disabled={!form.projectId || tasks.length === 0}
        >
          <option value="">Select Task</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Allocation %"
          value={form.allocation}
          onChange={(e) => setForm({ ...form, allocation: parseInt(e.target.value) })}
          required
          min="1"
          max="100"
          className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 text-base"
        />

        <button
          type="submit"
          className="md:col-span-4 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold text-base transition focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Assign Engineer
        </button>
      </form>

      {/* Assignments Table Card with hover effect */}
      <div className="overflow-x-auto w-full bg-white rounded-2xl shadow-lg transition-all duration-300 border-t-4 border-indigo-100 hover:shadow-2xl hover:scale-[1.01] hover:border-indigo-400">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-base font-semibold text-gray-700">Engineer</th>
              <th className="px-6 py-4 text-left text-base font-semibold text-gray-700">Project</th>
              <th className="px-6 py-4 text-left text-base font-semibold text-gray-700">Task</th>
              <th className="px-6 py-4 text-left text-base font-semibold text-gray-700">Status</th>
              <th className="px-6 py-4 text-left text-base font-semibold text-gray-700">Allocation (%)</th>
              <th className="px-6 py-4 text-left text-base font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((item, idx) => (
              <tr key={idx} className="border-b hover:bg-blue-50 transition">
                <td className="px-6 py-4 text-gray-800 text-base">{item.user?.name}</td>
                <td className="px-6 py-4 text-gray-800 text-base">{item.project?.name}</td>
                <td className="px-6 py-4 text-gray-800 text-base">{item.task?.title || "—"}</td>
                <td className="px-6 py-4">
                  {item.task?.status === "COMPLETED" ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded font-semibold text-sm">
                      Completed
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-800 text-base">{item.allocation}%</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleUnassign(item.id)}
                    className="text-red-600 hover:underline text-base font-medium focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    Unassign
                  </button>
                </td>
              </tr>
            ))}
            {assignments.length === 0 && !error && (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500 text-base">
                  No assignments available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Unassign Confirmation Modal */}
      <Modal isOpen={showUnassignModal} onClose={closeUnassignModal} showCloseButton={false}>
        <div className="p-8 bg-white rounded-2xl shadow-xl max-w-md w-full mx-auto text-center">
          {/* Icon and content */}
          <div className="mb-4 flex justify-center">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24">
                <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unassign Engineer?</h2>
          <p className="text-gray-600 mb-6">Are you sure you want to unassign this engineer? This action cannot be undone.</p>
          <div className="flex justify-center gap-4">
            <Button variant="primary" onClick={confirmUnassign} className="min-w-[100px]">Ok</Button>
            <Button variant="outline" onClick={closeUnassignModal} className="min-w-[100px]">Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Assignments;