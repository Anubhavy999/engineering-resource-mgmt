import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { getEmail, emitRoleChange } from "../utils/auth";
import { FaUser, FaEnvelope, FaBuilding, FaUserTag, FaTools, FaBatteryHalf, FaClock } from 'react-icons/fa';

// Simple avatar generator (initials)
const Avatar = ({ name }) => (
  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
    {name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)}
  </div>
);

const AddEngineer = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "ENGINEER",
    skills: "",
    department: "",
    capacity: 100,
  });
  const [editingId, setEditingId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailsUserId, setDetailsUserId] = useState(null);

  // Refs for each input field in the form
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const departmentRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const skillsRef = useRef();
  const capacityRef = useRef();

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

  // Auto-open form when editing
  useEffect(() => {
    if (editingId) setFormOpen(true);
  }, [editingId]);

  // 1) Fetch full list of users from server
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      setAllUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2) Decide which users should be visible based on your role & managerId
  useEffect(() => {
    const meEmail = getEmail();
    const currentUser = allUsers.find((u) => u.email === meEmail);
    setMe(currentUser);

    if (!currentUser) {
      setVisibleUsers([]);
      return;
    }

    // Show all users except self, super-admin, and promoter
    const visible = allUsers.filter(
      (u) =>
        u.id !== currentUser.id &&
        !u.isSuperAdmin &&
        u.id !== currentUser.managerId
    );
    setVisibleUsers(visible);
  }, [allUsers]);

  // FIELD‐CHANGE handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setError("");
    setMessage("");
  };

  // SUBMIT add/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        ...(formData.password && { password: formData.password }),
        skills: formData.skills,
        department: formData.department,
        maxCapacity: formData.capacity,
      };

      if (editingId) {
        await api.put(
          `/users/${editingId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        setMessage("User updated successfully!");
      } else {
        await api.post(
          "/auth/register",
          payload,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        setMessage("Engineer registered successfully!");
      }

      // reset form & reload list
      setEditingId(null);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: "ENGINEER",
        skills: "",
        department: "",
        capacity: 100,
      });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  // click “Edit” in menu
  const handleEdit = (u) => {
    setFormData({
      firstName: u.firstName || "",
      lastName: u.lastName || "",
      email: u.email,
      password: "",
      role: u.role,
      skills: u.skills || "",
      department: u.department || "",
      capacity: u.maxCapacity || 100,
    });
    setEditingId(u.id);
    setDropdownOpenId(null);
  };

  // cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "ENGINEER",
      skills: "",
      department: "",
      capacity: 100,
    });
    setMessage("");
    setError("");
  };

  // “Remove” user
  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user:", err);
    }
  };

  // Toggle role via dedicated endpoint
  const handleToggleRole = async (u) => {
    const newRole = u.role === "ENGINEER" ? "MANAGER" : "ENGINEER";
    try {
      await api.put(
        `/users/${u.id}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      // if this is yourself, update session+emit+reload
      if (sessionStorage.getItem("email") === u.email) {
        sessionStorage.setItem("role", newRole);
        emitRoleChange(newRole);
        window.location.reload();
      } else {
        fetchUsers();
      }
      setDropdownOpenId(null);
    } catch (err) {
      console.error("Failed to update role:", err);
    }
  };

  // RBAC for promote/demote
  const canToggleRole = (u) => {
    if (!me) return false;
    if (u.id === me.id || u.isSuperAdmin || u.id === me.managerId) return false;
    if (me.isSuperAdmin) return true;
    if (u.role === "ENGINEER") return true;
    if (u.role === "MANAGER" && u.managerId === me.id) return true;
    return false;
  };

  // RBAC for edit
  const canEdit = (u) => {
    if (!me) return false;
    if (me.isSuperAdmin) return u.id !== me.id && !u.isSuperAdmin;
    if (u.id === me.id) return true; // can edit self
    if (u.id === me.managerId || u.isSuperAdmin) return false;
    if (u.role === "ENGINEER") return true;
    if (u.role === "MANAGER" && u.managerId === me.id) return true;
    return false;
  };

  // RBAC for delete
  const canDelete = (u) => {
    if (!me) return false;
    if (u.id === me.id || u.isSuperAdmin || u.id === me.managerId) return false;
    if (me.isSuperAdmin) return true;
    if (u.role === "ENGINEER") return true;
    if (u.role === "MANAGER" && u.managerId === me.id) return true;
    return false;
  };

  const handleShowDetails = (userId) => {
    setDropdownOpenId(null); // Close dropdown instantly
    setDetailsUserId(detailsUserId === userId ? null : userId);
  };
  const handleCloseDetailsCard = () => {
    setDetailsUserId(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 bg-gradient-to-br from-blue-50 via-white to-purple-50 min-h-screen">
      {/* ── COLLAPSIBLE FORM ─────────────── */}
      <div className="mb-8">
        <button
          onClick={() => setFormOpen((open) => !open)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition w-full flex items-center justify-center shadow-md hover:shadow-lg"
          aria-expanded={formOpen}
          aria-controls="add-engineer-form"
        >
          {formOpen || editingId ? "Close Form" : "Add New Engineer"}
          <svg
            className={`ml-2 w-5 h-5 transform transition-transform ${formOpen || editingId ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {(formOpen || editingId) && (
          <div
            id="add-engineer-form"
            className="bg-white rounded-2xl shadow-lg p-8 mt-4 animate-fade-in transition-all duration-300 border-t-4 border-blue-100 hover:shadow-2xl hover:scale-[1.01] hover:border-blue-400"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-900 flex items-center gap-2">
              <FaUser className="text-blue-400" />
              {editingId ? "Edit User" : "Add New Engineer"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1" htmlFor="firstName">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    ref={firstNameRef}
                    onKeyDown={e => handleFieldKeyDown(e, lastNameRef)}
                    placeholder="e.g. Jane"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1" htmlFor="lastName">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    ref={lastNameRef}
                    onKeyDown={e => handleFieldKeyDown(e, departmentRef)}
                    placeholder="e.g. Doe"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="department">
                  Department
                </label>
                <input
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  ref={departmentRef}
                  onKeyDown={e => handleFieldKeyDown(e, emailRef)}
                  placeholder="e.g. Software Engineering"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  ref={emailRef}
                  onKeyDown={e => handleFieldKeyDown(e, passwordRef)}
                  placeholder="e.g. jane@example.com"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="password">
                  {editingId ? "New Password (optional)" : "Password"}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  ref={passwordRef}
                  onKeyDown={e => handleFieldKeyDown(e, skillsRef)}
                  placeholder={editingId ? "Leave blank to keep current" : "Password"}
                  required={!editingId}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="skills">
                  Skills
                </label>
                <input
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  ref={skillsRef}
                  onKeyDown={e => handleFieldKeyDown(e, capacityRef)}
                  placeholder="e.g. React, Node.js"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                />
                <span className="text-xs text-gray-400">Comma-separated</span>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1" htmlFor="capacity">
                  Capacity (%)
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.capacity}
                  onChange={handleChange}
                  ref={capacityRef}
                  onKeyDown={e => handleFieldKeyDown(e, null)}
                  placeholder="100"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="flex items-center gap-4 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {editingId ? "Update User" : "Register Engineer"}
                </button>
                {editingId && (
                  <button
                    onClick={handleCancelEdit}
                    type="button"
                    className="text-gray-600 underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
              {message && (
                <p className="mt-4 text-green-600 animate-pulse">{message}</p>
              )}
              {error && <p className="mt-4 text-red-600 animate-pulse">{error}</p>}
            </form>
          </div>
        )}
      </div>

      {/* ── USER LIST ───────── */}
      <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 border-t-4 border-indigo-100 hover:shadow-2xl hover:scale-[1.01] hover:border-indigo-400">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 flex items-center gap-2">
          <FaUser className="text-indigo-400" />
          All Users
        </h2>
        <div className="max-h-[500px] overflow-y-auto overflow-x-hidden">
          <ul className="space-y-4">
            {visibleUsers.map((u) => (
              <React.Fragment key={u.id}>
                <li
                  key={u.id}
                  className={`flex items-center justify-between bg-gray-50 rounded-lg p-4 shadow-sm border border-transparent hover:shadow-xl hover:scale-[1.015] hover:border-blue-300 transition-all duration-200 relative ${dropdownOpenId === u.id ? 'z-30' : 'z-0'}`}
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name} />
                    <div>
                      <p className="font-medium text-gray-800">{`${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name}</p>
                      <p className="text-sm text-gray-500">{u.email}</p>
                      <p className="text-xs text-gray-400">Role: {u.role}</p>
                      {u.department && <p className="text-xs text-gray-400">Dept: {u.department}</p>}
                    </div>
                  </div>
                  {/* ⋮ ACTION MENU */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setDropdownOpenId(dropdownOpenId === u.id ? null : u.id)
                      }
                      className="text-gray-500 hover:text-gray-800 px-2 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                      aria-label="Open user actions"
                    >
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                      </svg>
                    </button>
                    {dropdownOpenId === u.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white border shadow-lg rounded-lg z-20">
                        {canEdit(u) && (
                          <button
                            onClick={() => handleEdit(u)}
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete(u) && (
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-red-600"
                          >
                            Remove
                          </button>
                        )}
                        {canToggleRole(u) && (
                          <button
                            onClick={() => handleToggleRole(u)}
                            className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-blue-600"
                          >
                            Make {u.role === "ENGINEER" ? "Manager" : "Engineer"}
                          </button>
                        )}
                        <button
                          onClick={() => handleShowDetails(u.id)}
                          className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-blue-600"
                        >
                          Details
                        </button>
                      </div>
                    )}
                  </div>
                </li>
                {detailsUserId === u.id && (
                  <div className="bg-white rounded-xl shadow p-6 my-2 flex flex-col gap-2 relative">
                    <button
                      onClick={handleCloseDetailsCard}
                      className="absolute -top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                      style={{ lineHeight: '1', padding: 0 }}
                      title="Close"
                    >
                      &times;
                    </button>
                    <div className="flex items-center gap-2"><FaUser className="text-gray-400" /><span className="font-medium">Name:</span> {u.firstName} {u.lastName}</div>
                    <div className="flex items-center gap-2"><FaEnvelope className="text-gray-400" /><span className="font-medium">Email:</span> {u.email}</div>
                    <div className="flex items-center gap-2"><FaBuilding className="text-gray-400" /><span className="font-medium">Department:</span> {u.department || '-'}</div>
                    <div className="flex items-center gap-2"><FaUserTag className="text-gray-400" /><span className="font-medium">Role:</span> {u.role}</div>
                    <div className="flex items-center gap-2"><FaTools className="text-gray-400" /><span className="font-medium">Skills:</span> {u.skills || '-'}</div>
                    <div className="flex items-center gap-2"><FaBatteryHalf className="text-gray-400" /><span className="font-medium">Capacity:</span> {u.maxCapacity || 100}%</div>
                    <div className="flex items-center gap-2"><FaClock className="text-gray-400" /><span className="font-medium">Last Login:</span> {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : '-'}</div>
                  </div>
                )}
              </React.Fragment>
            ))}
            {visibleUsers.length === 0 && (
              <li className="text-gray-400 text-center py-8">
                No users to display.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddEngineer;
