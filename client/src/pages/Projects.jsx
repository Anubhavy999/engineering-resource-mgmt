import React, { useEffect, useState } from "react";
import axios from "axios";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/projects", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProjects(res.data);
      } catch (err) {
        setError("Failed to fetch projects.");
        console.error(err);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Projects</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project, index) => (
          <div key={index} className="p-4 bg-white shadow rounded border">
            <h2 className="text-lg font-bold text-gray-700">{project.name}</h2>
            <p className="text-gray-600 mt-1">{project.description || "No description provided."}</p>
            <p className="text-sm text-gray-500 mt-2">Start Date: {project.startDate?.slice(0, 10)}</p>
          </div>
        ))}
        {projects.length === 0 && !error && (
          <p className="text-center text-gray-500 col-span-full">No projects found.</p>
        )}
      </div>
    </div>
  );
};

export default Projects;
