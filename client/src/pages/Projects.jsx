import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import api from "../services/api";

const badgeColors = {
  ACTIVE: "bg-blue-100 text-blue-800",
  CLOSED: "bg-gray-200 text-gray-700",
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-green-100 text-green-800",
  COMPLETED: "bg-green-100 text-green-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
};

// Add this helper component at the top (after imports)
function HangingDescription({ label, text }) {
  return (
    <div className="flex mb-2">
      <span className="font-semibold flex-shrink-0" style={{ minWidth: 100 }}>
        {label}
      </span>
      <span className="hanging-indent whitespace-pre-line text-gray-700 text-justify" style={{ display: 'block' }}>
        {text || "No description provided."}
      </span>
    </div>
  );
}

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // Add success state
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    startDate: "",
  });
  const [tasks, setTasks] = useState([]);
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [editProjectId, setEditProjectId] = useState(null); // Track which project is being edited

  // Add loading states
  const [loadingActions, setLoadingActions] = useState({});

  // Add collapsible form state
  const [formOpen, setFormOpen] = useState(false);

  // Auto-open form when editing
  useEffect(() => {
    if (editProjectId) setFormOpen(true);
  }, [editProjectId]);

  // 1. Use useEffect to watch for changes in expandedProjectId or projects
  useEffect(() => {
    if (expandedProjectId) {
      fetchProjectDetails(expandedProjectId);
    }
    // eslint-disable-next-line
  }, [expandedProjectId, projects.length]);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
      // Do NOT call fetchProjectDetails here, let the useEffect above handle it
    } catch (err) {
      setError("Failed to fetch projects.");
      console.error(err);
    }
  };

  const fetchProjectDetails = async (id) => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProjects((prev) =>
        prev.map((proj) => (proj.id === id ? { ...proj, details: res.data } : proj))
      );
    } catch (err) {
      console.error("Failed to fetch project details:", err);
    }
  };

  // Auto-refresh all project details periodically
  useEffect(() => {
    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({ ...prev, [name]: value }));
    // Clear messages when user starts typing
    setError("");
    setSuccess("");
  };

  // Task management functions
  const addTask = () => {
    if (tasks.length < 20) {
      setTasks([...tasks, { title: "", description: "", priority: "MEDIUM" }]);
    }
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...newProject,
        tasks: tasks.filter(task => task.title.trim() !== "")
      };
      
      await api.post("/projects", projectData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      
      // Clear form
      setNewProject({ name: "", description: "", startDate: "" });
      setTasks([]);
      
      // Show success message
      setSuccess("Project added successfully!");
      setError("");
      
      // Refresh projects list
      fetchProjects();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
      
    } catch (err) {
      setError("Failed to add project.");
      setSuccess("");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const toggleExpand = (id) => {
    if (expandedProjectId === id) {
      setExpandedProjectId(null);
    } else {
      fetchProjectDetails(id);
      setExpandedProjectId(id);
    }
  };

  const handleMarkDone = async (projectId) => {
    try {
      await api.post(
        `/projects/${projectId}/close`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      // Refresh both the specific project details and the full list
      fetchProjectDetails(projectId);
      fetchProjects();
    } catch (err) {
      alert("Failed to mark project as completed.");
      console.error(err);
    }
  };

  const handleReopen = async (projectId) => {
    try {
      await api.post(
        `/projects/${projectId}/reopen`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      fetchProjectDetails(projectId);
      fetchProjects();
    } catch (err) {
      alert("Failed to reopen project.");
      console.error(err);
    }
  };

  const handleApproveCompletion = async (taskId) => {
    setLoadingActions(prev => ({ ...prev, [taskId]: 'approving' }));
    try {
      await api.post(
        `/projects/tasks/${taskId}/approve-completion`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      
      // Show success message
      setSuccess("Task marked as completed successfully!");
      
      // Refresh the specific project details to update the UI
      if (expandedProjectId) {
        fetchProjectDetails(expandedProjectId);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to approve completion request.");
      setTimeout(() => setError(""), 3000);
      console.error(err);
    } finally {
      setLoadingActions(prev => ({ ...prev, [taskId]: null }));
    }
  };

  const handleRejectCompletion = async (taskId) => {
    setLoadingActions(prev => ({ ...prev, [taskId]: 'rejecting' }));
    try {
      await api.post(
        `/projects/tasks/${taskId}/reject-completion`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      
      // Show success message
      setSuccess("Completion request rejected successfully!");
      
      // Refresh the specific project details to update the UI
      if (expandedProjectId) {
        fetchProjectDetails(expandedProjectId);
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to reject completion request.");
      setTimeout(() => setError(""), 3000);
      console.error(err);
    } finally {
      setLoadingActions(prev => ({ ...prev, [taskId]: null }));
    }
  };

  // When Edit is clicked, populate form with project data
  const handleEdit = (project) => {
    setEditProjectId(project.id);
    setNewProject({
      name: project.name,
      description: project.details?.description || project.description || "",
      startDate: (project.details?.startDate || project.startDate || "").slice(0, 10),
    });
    setTasks(
      (project.details?.tasks || project.tasks || []).map((t) => ({
        id: t.id, // <-- CRITICAL: preserve id!
        title: t.title,
        description: t.description,
        priority: t.priority || "MEDIUM",
      }))
    );
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditProjectId(null);
    setNewProject({ name: "", description: "", startDate: "" });
    setTasks([]);
    setError("");
    setSuccess("");
  };

  // Update project (PUT)
  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const projectData = {
        ...newProject,
        tasks: tasks.filter((task) => task.title.trim() !== ""),
      };
      await api.put(
        `/projects/${editProjectId}`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      setSuccess("Project updated successfully!");
      setError("");
      setEditProjectId(null);
      setExpandedProjectId(null); // <-- Reset expanded project after update
      setNewProject({ name: "", description: "", startDate: "" });
      setTasks([]);
      fetchProjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update project.");
      setSuccess("");
      console.error(err);
    }
  };

  const [commentInputs, setCommentInputs] = useState({}); // { [taskId]: "" }
  const [taskComments, setTaskComments] = useState({}); // { [taskId]: [comments] }

  const fetchTaskComments = async (taskId) => {
    try {
      const res = await api.get(`/projects/tasks/${taskId}/comments`);
      setTaskComments((prev) => ({ ...prev, [taskId]: res.data }));
    } catch (err) {
      setTaskComments((prev) => ({ ...prev, [taskId]: [] }));
    }
  };

  const handleCommentInput = (taskId, value) => {
    setCommentInputs((prev) => ({ ...prev, [taskId]: value }));
  };

  const handleAddComment = async (taskId) => {
    const content = commentInputs[taskId];
    if (!content) return;
    try {
      await api.post(
        `/projects/tasks/${taskId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
      );
      setCommentInputs((prev) => ({ ...prev, [taskId]: "" }));
      fetchTaskComments(taskId);
    } catch (err) {
      alert("Failed to add comment");
    }
  };

  // Add this handler
  const handleDeleteComments = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete all comments for this task?")) return;
    try {
      await api.delete(`/projects/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      fetchTaskComments(taskId);
    } catch (err) {
      alert("Failed to delete comments");
    }
  };

  // Refs for each input field in the project form
  const nameRef = useRef();
  const descriptionRef = useRef();
  const startDateRef = useRef();

  // Handler to move to next field on Enter
  const handleFieldKeyDown = (e, nextRef) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (nextRef && nextRef.current) {
        nextRef.current.focus();
      } else {
        // If no nextRef, submit the form
        e.target.form && e.target.form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* ── COLLAPSIBLE FORM ─────────────── */}
      <div className="mb-8">
        <button
          onClick={() => setFormOpen((open) => !open)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full flex items-center justify-center shadow-md hover:shadow-lg"
          aria-expanded={formOpen}
          aria-controls="add-project-form"
        >
          {formOpen || editProjectId ? (editProjectId ? "Close Edit Form" : "Close Form") : "Add New Project"}
          <svg
            className={`ml-2 w-5 h-5 transform transition-transform ${formOpen || editProjectId ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {(formOpen || editProjectId) && (
          <div
            id="add-project-form"
            className="bg-white rounded-2xl shadow-lg p-8 mt-4 animate-fade-in transition-all duration-300 border-t-4 border-blue-100 hover:shadow-2xl hover:scale-[1.01] hover:border-blue-400"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              {/* Optionally add an icon here for visual flair */}
              {editProjectId ? "Edit Project" : "Add New Project"}
            </h2>
            {/* Success/Error Feedback */}
            {success && (
              <p className="mb-3 text-green-600 animate-pulse">{success}</p>
            )}
            {error && <p className="mb-3 text-red-600 animate-pulse">{error}</p>}
            <form onSubmit={editProjectId ? handleUpdateProject : handleAddProject} className="space-y-5">
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="name">
                  Project Name
                </label>
        <input
                  id="name"
          name="name"
          value={newProject.name}
          onChange={handleInputChange}
          ref={nameRef}
          onKeyDown={e => handleFieldKeyDown(e, descriptionRef)}
          placeholder="e.g. Website Redesign"
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
        />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="description">
                  Description
                </label>
        <textarea
                  id="description"
          name="description"
          value={newProject.description}
          onChange={handleInputChange}
          ref={descriptionRef}
          onKeyDown={e => handleFieldKeyDown(e, startDateRef)}
          placeholder="Project description"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
        />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="startDate">
                  Start Date
                </label>
        <input
                  id="startDate"
                  name="startDate"
          type="date"
          value={newProject.startDate}
          onChange={handleInputChange}
          ref={startDateRef}
          onKeyDown={e => handleFieldKeyDown(e, null)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
        />
              </div>
              {/* Tasks Section */}
              <div className="border-t pt-4 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-md font-semibold text-gray-700">Tasks <span className="text-xs text-gray-400">({tasks.length}/20)</span></h3>
                  {tasks.length < 20 && (
                    <button
                      type="button"
                      onClick={addTask}
                      className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                    >
                      Add Task
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={index} className="border rounded p-3 bg-gray-50 relative">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-700">Task {index + 1}</h4>
        <button
                          type="button"
                          onClick={() => removeTask(index)}
                          className="text-red-500 hover:text-red-700 text-xs"
        >
                          Remove
        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Task Title"
                        value={task.title}
                        onChange={(e) => updateTask(index, "title", e.target.value)}
                        className="w-full border p-2 rounded mb-2 text-sm"
                      />
                      <textarea
                        placeholder="Task Description"
                        value={task.description}
                        onChange={(e) => updateTask(index, "description", e.target.value)}
                        className="w-full border p-2 rounded mb-2 text-sm"
                        rows="2"
                      />
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(index, "priority", e.target.value)}
                        className="w-full border p-2 rounded text-sm"
                      >
                        <option value="LOW">Low Priority</option>
                        <option value="MEDIUM">Medium Priority</option>
                        <option value="HIGH">High Priority</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {editProjectId ? "Update Project" : "Add Project"}
                </button>
                {editProjectId && (
                  <button
                    onClick={handleCancelEdit}
                    type="button"
                    className="text-gray-600 underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
              {/* Success/Error Feedback below button */}
              {success && (
                <p className="mt-4 text-green-600 animate-pulse">{success}</p>
              )}
              {error && <p className="mt-4 text-red-600 animate-pulse">{error}</p>}
            </form>
          </div>
        )}
      </div>

      {/* ── PROJECT LIST ───────── */}
      <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 border-t-4 border-indigo-100 hover:shadow-2xl hover:scale-[1.01] hover:border-indigo-400">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
          {/* Optionally add an icon here for visual flair */}
          All Projects
        </h2>
        <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
          <ul className="space-y-8">
            {projects.map((project) => (
              <li
                key={project.id}
                className="bg-white rounded-2xl border border-blue-200 shadow-2xl p-6 transition-all relative hover:shadow-2xl hover:scale-[1.01] hover:border-blue-400 duration-200"
                style={{ boxShadow: '0 8px 32px 0 rgba(30,64,175,0.10)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-lg">{project.name}</p>
                    <p className="text-xs text-gray-500">Status: {project.isClosed ? "Closed" : "Active"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleExpand(project.id)}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      {expandedProjectId === project.id ? "Hide" : "Details"}
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
                    >
                      Edit
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
                {/* Expanded Project Details */}
            {expandedProjectId === project.id && project.details && (
                  <div className="mt-4 border-t pt-4 text-sm text-gray-700">
                    <HangingDescription label="Description :" text={project.details.description} />
                    <div className="mb-2">
                      <span className="font-semibold">Start Date:</span> {project.details.startDate?.slice(0, 10)}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">End Date:</span> {project.details.endDate?.slice(0, 10) || "Ongoing"}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Created By:</span> {project.details.createdBy?.name || "Unknown"}
                    </div>
                    {/* Tasks Section */}
                    {project.details.tasks && project.details.tasks.length > 0 && (
                      <div className="mt-4 bg-blue-50/40 rounded-xl p-4">
                        <h3 className="font-semibold mb-2">Tasks ({project.details.tasks.length}):</h3>
                        <ul className="space-y-4">
                          {project.details.tasks.map((task) => (
                            <li key={task.id} className="bg-white border-l-4 border-blue-300 rounded-lg p-4 relative shadow-sm ml-4 hover:shadow-xl hover:scale-[1.01] hover:border-blue-500 transition-all duration-200">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-800 text-base mb-1">{task.title}</h4>
                                  <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                                  <div className="flex gap-2 mt-1 text-xs">
                                    <span className={`px-2 py-1 rounded ${
                                      task.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                                      task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-green-100 text-green-800'
                                    }`}>
                                      {task.priority} Priority
                                    </span>
                                    <span className={`px-2 py-1 rounded ${
                                      task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                      task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {task.status}
                                    </span>
                                    {task.completionRequested && (
                                      <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                                        Completion Requested
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {/* Assigned badge at top right */}
                                <div className="flex flex-col items-end min-w-[120px] ml-4">
                                  {task.assignments && task.assignments.length > 0 ? (
                                    <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                                      Assigned: {task.assignments.map(a => a.user?.name).filter(Boolean).join(", ")}
                                    </span>
                                  ) : (
                                    <span className="inline-block bg-gray-100 text-gray-400 text-xs font-semibold px-3 py-1 rounded-full mb-2">
                                      Unassigned
                                    </span>
                                  )}
                                </div>
                                {/* Completion Actions */}
                                {task.completionRequested && task.status !== "COMPLETED" && (
                                  <div className="flex flex-col gap-2 ml-4">
                                    <button
                                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${loadingActions[task.id] === 'approving' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'}`}
                                      onClick={() => handleApproveCompletion(task.id)}
                                      disabled={loadingActions[task.id] === 'approving'}
                                    >
                                      {loadingActions[task.id] === 'approving' ? 'Approving...' : 'Approve'}
                                    </button>
                                    <button
                                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${loadingActions[task.id] === 'rejecting' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'}`}
                                      onClick={() => handleRejectCompletion(task.id)}
                                      disabled={loadingActions[task.id] === 'rejecting'}
                                    >
                                      {loadingActions[task.id] === 'rejecting' ? 'Rejecting...' : 'Reject'}
                                    </button>
                                  </div>
                                )}
                              </div>
                              {/* Comments Section */}
                              <div className="mt-2">
                                <button
                                  className="text-blue-600 underline text-xs"
                                  onClick={() => fetchTaskComments(task.id)}
                                >
                                  Show Comments
                                </button>
                                {/* Delete Comments button for MANAGER */}
                                {sessionStorage.getItem("role") === "MANAGER" && (
                                  <button
                                    className="ml-2 text-red-600 underline text-xs"
                                    onClick={() => handleDeleteComments(task.id)}
                                  >
                                    Delete Comments
                                  </button>
                                )}
                                <div>
                                  {(taskComments[task.id] || []).map((comment) => (
                                    <div key={comment.id} className="text-xs text-gray-700 border-b py-1">
                                      <strong>{comment.author?.name}:</strong> {comment.content}
                                      <span className="ml-2 text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
                                    </div>
                                  ))}
                                </div>
                                {/* Add comment input for managers */}
                                {sessionStorage.getItem("role") === "MANAGER" && (
                                  <div className="flex items-center mt-1">
                                    <input
                                      type="text"
                                      value={commentInputs[task.id] || ""}
                                      onChange={(e) => handleCommentInput(task.id, e.target.value)}
                                      placeholder="Add a comment..."
                                      className="border p-1 rounded text-xs flex-1"
                                    />
                                    <button
                                      className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs"
                                      onClick={() => handleAddComment(task.id)}
                                    >
                                      Comment
                                    </button>
                                  </div>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Assignments Section */}
                {project.details.assignments?.length > 0 && (
                  <div className="mt-3">
                        <p className="font-semibold">All Assigned Engineers:</p>
                    <ul className="list-disc list-inside">
                      {project.details.assignments.map((a, idx) => (
                        <li key={idx}>{a.user?.name} - {a.allocation}%</li>
                      ))}
                    </ul>
                  </div>
                )}
                    {/* Project Actions */}
                    <div className="flex gap-3 mt-4">
                      {!project.details.isClosed ? (
                        <button
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-semibold"
                          onClick={() => handleMarkDone(project.id)}
                        >
                          Mark as Done
                        </button>
                      ) : (
                        <button
                          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 font-semibold"
                          onClick={() => handleReopen(project.id)}
                        >
                          Reopen Project
                        </button>
                      )}
                    </div>
              </div>
                )}
              </li>
            ))}
            {projects.length === 0 && (
              <li className="text-gray-400 text-center py-8">
                No projects to display.
              </li>
            )}
          </ul>
          </div>
      </div>
    </div>
  );
};

export default Projects;
