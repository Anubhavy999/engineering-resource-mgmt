import React, { useState } from "react";
import axios from "axios";

const AddEngineer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ENGINEER",
    skills: "",
    capacity: 100,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", formData);
      setMessage("✅ Engineer registered successfully!");
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "ENGINEER",
        skills: "",
        capacity: 100,
      });
    } catch (err) {
      setError(err.response?.data?.message || "❌ Registration failed.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Engineer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="skills"
          placeholder="Skills (comma-separated)"
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={formData.skills}
          onChange={handleChange}
        />

        <input
          type="number"
          name="capacity"
          placeholder="Capacity (e.g. 100)"
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={formData.capacity}
          onChange={handleChange}
          min="0"
          max="100"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          Register Engineer
        </button>
      </form>

      {message && <p className="mt-4 text-green-600 font-medium">{message}</p>}
      {error && <p className="mt-4 text-red-600 font-medium">{error}</p>}
    </div>
  );
};

export default AddEngineer;
