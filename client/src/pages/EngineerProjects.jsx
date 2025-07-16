import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../services/api";

const EngineerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Add these state variables at the top of your component
  const [taskComments, setTaskComments] = useState({}); // { [taskId]: [comments] }
  const [showComments, setShowComments] = useState({}); // { [taskId]: boolean }
  // New state for comment counts
  const [taskCommentCounts, setTaskCommentCounts] = useState({}); // { [taskId]: number }

  const currentUserId = Number(sessionStorage.getItem("id"));
  if (!currentUserId) {
    // Optionally, redirect to login or show an error
    console.warn("User ID not found in sessionStorage. Please log in again.");
  }
  console.log("currentUserId", currentUserId);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/projects/assigned", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        setProjects(res.data);
        // After projects are loaded, fetch comment counts for all tasks
        const allAssignments = res.data.flatMap(p => p.assignments || []);
        const allTaskIds = allAssignments.filter(a => a.task).map(a => a.task.id);
        // Remove duplicates
        const uniqueTaskIds = Array.from(new Set(allTaskIds));
        // Fetch counts in parallel
        const counts = await Promise.all(uniqueTaskIds.map(async (taskId) => {
          try {
            const res = await api.get(`/projects/tasks/${taskId}/comments/count`, {
              headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
            });
            return [taskId, res.data.count];
          } catch {
            return [taskId, 0];
          }
        }));
        setTaskCommentCounts(Object.fromEntries(counts));
      } catch (err) {
        setError("Failed to fetch assigned projects.");
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleCompletionRequest = async (taskId) => {
    try {
      await api.post(
        `/projects/tasks/${taskId}/request-completion`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      setMessage("Completion request sent!");
      
      // Refetch all projects from backend instead of updating local state
      const res = await api.get("/projects/assigned", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      setProjects(res.data);
      
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setError("Failed to send completion request.");
      setTimeout(() => setError(""), 2000);
    }
  };

  // Add this function to fetch comments for a specific task
  const fetchTaskComments = async (taskId) => {
    try {
      const res = await api.get(`/projects/tasks/${taskId}/comments`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });
      setTaskComments((prev) => ({ ...prev, [taskId]: res.data }));
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setTaskComments((prev) => ({ ...prev, [taskId]: [] }));
    }
  };

  // Add this function to toggle comment visibility
  const toggleComments = (taskId) => {
    setShowComments((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
    if (!taskComments[taskId]) {
      fetchTaskComments(taskId);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        {/* Optionally add an icon here for visual flair */}
        My Projects
      </h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}
      {loading ? (
        <p className="text-gray-500">Loading projects...</p>
      ) : (
      <div className="grid gap-4 md:grid-cols-2">
          {projects.length === 0 && !error && (
            <p className="text-center text-gray-500 col-span-full">No assigned projects found.</p>
          )}
          {projects.map((project) => {
            console.log("Project:", project.name, "Assignments:", project.assignments);

            // Find assignments for this engineer in this project that have a task
            const myAssignments = (project.assignments || []).filter(
              (a) => Number(a.user?.id) === currentUserId && a.task
            );
            console.log("myAssignments for project", project.name, myAssignments);
            
            return (
              <div key={project.id} className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-2xl hover:scale-[1.01] hover:border-blue-400 transition-all duration-300 overflow-hidden">
                {/* Project Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {project.name}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          project.isClosed 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            project.isClosed ? 'bg-red-400' : 'bg-green-400'
                          }`}></div>
                          {project.isClosed ? 'Closed' : 'Active'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {project.assignments?.length || 0} team members
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Project Description */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 text-justify">
              {project.description || "No description provided."}
            </p>

                  {/* Project Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-bold">Started:</span> <span className="font-bold ml-1">{project.startDate?.slice(0, 10)}</span>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {project.endDate ? <span className="font-bold">Ends: {project.endDate.slice(0, 10)}</span> : <span className="font-bold">Ongoing</span>}
                    </div>
                  </div>
                </div>

                {/* Your Tasks Section */}
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Your Tasks</h3>
                  </div>

                  {myAssignments.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <p className="text-sm text-gray-500">No tasks assigned to you for this project.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myAssignments.map((a) => (
                        <div key={a.task.id} className="bg-white border-l-4 border-blue-300 rounded-lg p-4 relative shadow-sm ml-4 transition-all duration-200 hover:shadow-xl hover:scale-[1.01] hover:border-blue-500">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-sm">{a.task.title}</h4>
                            <div className="flex items-center gap-2">
                              {a.task.completionRequested && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 border border-amber-200 rounded-full">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Requested
                                </span>
                              )}
                              {a.task.status === "COMPLETED" && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-emerald-700 bg-emerald-100 border border-emerald-200 rounded-full">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                  Completed
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {a.task.description && (
                            <p className="text-gray-600 text-xs mb-3 leading-relaxed">{a.task.description}</p>
                          )}
                          
                          {/* Comments Section */}
                          <div className="mb-3">
                            <button
                              onClick={() => toggleComments(a.task.id)}
                              className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              {showComments[a.task.id] ? 'Hide Comments' : 'Show Comments'}
                              {(typeof taskCommentCounts[a.task.id] === 'number' && taskCommentCounts[a.task.id] > 0) ? (
                                <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                                  {taskCommentCounts[a.task.id]}
                                </span>
                              ) : (taskComments[a.task.id]?.length > 0 && (
                                <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium px-1.5 py-0.5 rounded-full">
                                  {taskComments[a.task.id].length}
                                </span>
                              ))}
                            </button>
                            
                            {showComments[a.task.id] && (
                              <div className="mt-2 bg-white rounded border border-gray-200 p-3">
                                {taskComments[a.task.id]?.length > 0 ? (
                                  <div className="space-y-2">
                                    {taskComments[a.task.id].map((comment) => (
                                      <div key={comment.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                                        <div className="flex items-start justify-between mb-1">
                                          <span className="text-xs font-semibold text-gray-800">
                                            {comment.author?.name}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(comment.createdAt).toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="text-xs text-gray-700 leading-relaxed">
                                          {comment.content}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500 text-center py-2">
                                    No comments yet
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                                a.task.priority === 'HIGH' ? 'bg-red-100 text-red-700 border border-red-200' :
                                a.task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                'bg-green-100 text-green-700 border border-green-200'
                              }`}>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  {a.task.priority === 'HIGH' ? (
                                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                  ) : a.task.priority === 'MEDIUM' ? (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  ) : (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  )}
                                </svg>
                                Priority: {a.task.priority}
                              </span>
                              
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                                a.task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                a.task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                'bg-gray-100 text-gray-700 border border-gray-200'
                              }`}>
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  {a.task.status === 'COMPLETED' ? (
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  ) : a.task.status === 'IN_PROGRESS' ? (
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  ) : (
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                  )}
                                </svg>
                                Status: {a.task.status}
                              </span>
                            </div>
                            
                            {!a.task.completionRequested && a.task.status !== "COMPLETED" && !project.isClosed && (
                              <button
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 hover:border-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1"
                                onClick={() => handleCompletionRequest(a.task.id)}
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Request Completion
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Team Members Section */}
            {project.assignments && project.assignments.length > 0 && (
                  <div className="px-6 pb-6 border-t border-gray-100">
                    <div className="flex items-center mt-4 mb-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {project.assignments
                    .sort((a, b) => b.allocation - a.allocation)
                        .map((a) => (
                          <div
                            key={a.user?.id}
                            className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                              a.user?.id === currentUserId
                                ? 'bg-blue-50 border border-blue-200'
                                : 'bg-gray-50 border border-gray-100'
                            }`}
                          >
                            <div className="flex items-center">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                a.user?.id === currentUserId
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}>
                                {a.user?.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className={`ml-2 font-medium ${
                                a.user?.id === currentUserId
                                  ? 'text-blue-900'
                                  : 'text-gray-700'
                              }`}>
                                {a.user?.name}
                                {a.user?.id === currentUserId && (
                                  <span className="ml-1 text-blue-600">(You)</span>
                                )}
                              </span>
                            </div>
                            <span className={`text-xs font-medium ${
                              a.user?.id === currentUserId
                                ? 'text-blue-700'
                                : 'text-gray-500'
                            }`}>
                              {a.allocation}%
                            </span>
                          </div>
                    ))}
                    </div>
              </div>
            )}
          </div>
            );
          })}
      </div>
      )}
    </div>
  );
};

export default EngineerProjects;
