import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserAddressCard from "../components/UserProfile/UserAddressCard";
import { useEffect, useState } from "react";
import {
  fetchCurrentUser,
  updateCurrentUser,
  uploadAvatar,
  deleteCurrentUser,
  downloadProfilePdf
} from "../services/api";
import { Modal } from "../components/ui/modal";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import Label from "../components/form/Label";
import api from "../services/api";
import { FaUser, FaMapMarkerAlt, FaBriefcase, FaChartBar, FaCogs, FaLock, FaCamera, FaEnvelope, FaBuilding, FaUserTag, FaTools, FaBatteryHalf, FaClock } from 'react-icons/fa';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showProfModal, setShowProfModal] = useState(false);
  const [profForm, setProfForm] = useState({
    certifications: "",
    experience: "",
    department: ""
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => {
        setUser(data);
        setProfForm({
          certifications: data.certifications || "",
          experience: data.experience || "",
          department: data.department || ""
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (fields) => {
    // If firstName/lastName are present, update name as well
    let updateFields = { ...fields };
    if (fields.firstName !== undefined || fields.lastName !== undefined) {
      const first = fields.firstName !== undefined ? fields.firstName : user.firstName || "";
      const last = fields.lastName !== undefined ? fields.lastName : user.lastName || "";
      updateFields.name = `${first} ${last}`.trim();
    }
    const res = await updateCurrentUser(updateFields);
    setUser(res.user);
  };

  const handleAvatarUpload = async (avatarUrl) => {
    const res = await uploadAvatar(avatarUrl);
    setUser((u) => ({ ...u, avatarUrl: res.user.avatarUrl }));
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteCurrentUser();
      window.location.href = "/";
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await downloadProfilePdf();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "profile.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleProfEdit = () => {
    setProfForm({
      certifications: user.certifications || "",
      experience: user.experience || "",
      department: user.department || ""
    });
    setShowProfModal(true);
  };
  const handleProfChange = (e) => {
    setProfForm({ ...profForm, [e.target.name]: e.target.value });
  };
  const handleProfSave = async (e) => {
    e.preventDefault();
    const res = await updateCurrentUser({
      certifications: profForm.certifications,
      experience: profForm.experience,
      department: profForm.department
    });
    setUser(res.user);
    setShowProfModal(false);
  };

  const handleOpenPasswordModal = () => {
    setPasswordForm({ newPassword: "", confirmPassword: "" });
    setPasswordError("");
    setPasswordSuccess("");
    setShowPasswordModal(true);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    try {
      console.log("Attempting to change password...");
      await api.post("/users/me/change-password", { newPassword: passwordForm.newPassword });
      setPasswordSuccess("Password updated successfully.");
      setShowPasswordModal(false);
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password.");
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-lg text-gray-500">Loading profile...</div>;
  }
  if (!user) {
    return <div className="text-center py-20 text-lg text-red-500">Failed to load profile.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 via-60% to-purple-100 pb-24">
      <div className="max-w-5xl mx-auto px-6">
        {/* Profile Header */}
        <div className="relative mb-10">
          <div className="h-28 sm:h-32 md:h-36 bg-gradient-to-r from-blue-500 via-blue-400 via-60% to-purple-400 rounded-2xl shadow-2xl relative flex items-end justify-center border-t-4 border-blue-200">
            {/* Banner gradient with rounded corners and shadow */}
            <div className="absolute left-1/2 transform -translate-x-1/2 z-20" style={{ bottom: '-56px' }}>
              <div className="relative">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-28 h-28 rounded-full border-4 border-white shadow-2xl object-cover bg-gray-100"
                    style={{ boxShadow: '0 12px 36px 0 rgba(31, 38, 135, 0.25), 0 2px 8px 0 rgba(31,38,135,0.10)' }}
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full border-4 border-white shadow-2xl bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-700" style={{ boxShadow: '0 12px 36px 0 rgba(31, 38, 135, 0.25), 0 2px 8px 0 rgba(31,38,135,0.10)' }}>
                    {`${user.firstName?.[0] || user.name?.[0] || ''}${user.lastName?.[0] || user.name?.split(' ')[1]?.[0] || ''}`.toUpperCase()}
                  </div>
                )}
                <button
                  className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  onClick={() => document.getElementById('avatar-upload-input').click()}
                  title="Update Avatar"
                >
                  <FaCamera size={18} />
                </button>
                <input
                  id="avatar-upload-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      await handleAvatarUpload(url);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          {/* Name and role, tightly aligned to avatar and always centered */}
          <div className="flex flex-col items-center mb-2" style={{ marginTop: 'calc(56px + 0.5rem)' }}>
            <div className="flex flex-col items-center justify-center h-28">
              <h2 className="text-4xl font-extrabold text-gray-900 flex items-center gap-2 tracking-tight leading-tight mb-1">
                {user.firstName || user.name}
                {user.lastName && <span>{user.lastName}</span>}
              </h2>
              <span className="text-lg text-blue-700 font-semibold flex items-center gap-2">
                <FaUser className="inline-block text-blue-500 text-xl" />
                {user.isSuperAdmin ? "Super-Admin" : user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border-t-4 border-blue-200 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-2 mb-2">
              <FaUser className="text-blue-500" />
              <h4 className="text-lg font-semibold text-gray-800">Personal Information</h4>
            </div>
            <UserInfoCard user={user} onSave={handleUpdate} />
          </div>
          {/* Address Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-4 border-t-4 border-indigo-200 hover:shadow-2xl transition-all">
            <div className="flex items-center gap-2 mb-2">
              <FaMapMarkerAlt className="text-indigo-500" />
              <h4 className="text-lg font-semibold text-gray-800">Address & Contact</h4>
            </div>
            <UserAddressCard user={user} onSave={handleUpdate} />
          </div>
        </div>

        {/* Professional Details Card */}
        <div className="mt-10 bg-white rounded-2xl shadow-lg p-8 border-t-4 border-purple-200 hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaBriefcase className="text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-800">Professional Details</h3>
            </div>
            <button
              className="text-blue-600 underline text-sm font-medium hover:text-blue-800"
              onClick={handleProfEdit}
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Role/Title</p>
              <p className="text-sm font-medium text-gray-800">{user.isSuperAdmin ? "Super-Admin" : user.role}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Department/Team</p>
              <p className="text-sm font-medium text-gray-800">{user.department || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Skills</p>
              <p className="text-sm font-medium text-gray-800">{user.skills || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Experience</p>
              <p className="text-sm font-medium text-gray-800">{user.experience || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Certifications</p>
              <p className="text-sm font-medium text-gray-800">{user.certifications || '-'}</p>
            </div>
          </div>
          {/* Professional Details Edit Modal */}
          <Modal isOpen={showProfModal} onClose={() => setShowProfModal(false)} className="max-w-[500px] m-4">
            <div className="no-scrollbar relative w-full max-w-[500px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
              <div className="px-2 pr-14">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Professional Details</h4>
                <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">Update your certifications and experience.</p>
              </div>
              <form className="flex flex-col" onSubmit={handleProfSave}>
                <div className="custom-scrollbar h-[250px] overflow-y-auto px-2 pb-3">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Certifications</Label>
                      <Input name="certifications" type="text" value={profForm.certifications} onChange={handleProfChange} />
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Experience</Label>
                      <Input name="experience" type="text" value={profForm.experience} onChange={handleProfChange} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                  <Button size="sm" variant="outline" onClick={() => setShowProfModal(false)} type="button">Close</Button>
                  <Button size="sm" type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </Modal>
        </div>

        {/* Activity & Stats Card */}
        <div className="mt-10 bg-white rounded-2xl shadow-lg p-8 border-t-4 border-pink-200 hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaChartBar className="text-green-500" />
              <h3 className="text-lg font-semibold text-gray-800">Activity & Stats</h3>
            </div>
            <button onClick={() => setShowStats((s) => !s)} className="text-blue-600 underline text-sm font-medium hover:text-blue-800">{showStats ? 'Hide' : 'Show'}</button>
          </div>
          {showStats && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Last login</p>
                <p className="text-sm font-medium text-gray-800">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Projects Assigned</p>
                <p className="text-sm font-medium text-gray-800">{user.projectsAssigned ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tasks Completed</p>
                <p className="text-sm font-medium text-gray-800">{user.tasksCompleted ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Performance</p>
                <p className="text-sm font-medium text-gray-800">{user.performance || '-'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Preferences Card */}
        <div className="mt-10 bg-white rounded-2xl shadow-lg p-8 border-t-4 border-yellow-200 hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaCogs className="text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-800">Preferences</h3>
            </div>
            <button onClick={() => setShowPreferences((s) => !s)} className="text-blue-600 underline text-sm font-medium hover:text-blue-800">{showPreferences ? 'Hide' : 'Show'}</button>
          </div>
          {showPreferences && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Theme</p>
                <p className="text-sm font-medium text-gray-800">Dark</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Notifications</p>
                <p className="text-sm font-medium text-gray-800">Enabled</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Language</p>
                <p className="text-sm font-medium text-gray-800">English</p>
              </div>
            </div>
          )}
        </div>

        {/* Security Card */}
        <div className="mt-10 bg-white rounded-2xl shadow-lg p-8 border-t-4 border-red-200 hover:shadow-2xl transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FaLock className="text-red-500" />
              <h3 className="text-lg font-semibold text-gray-800">Security</h3>
            </div>
            <button onClick={() => setShowSecurity((s) => !s)} className="text-blue-600 underline text-sm font-medium hover:text-blue-800">{showSecurity ? 'Hide' : 'Show'}</button>
          </div>
          {showSecurity && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Change Password</p>
                <button className="text-blue-600 underline text-sm font-medium hover:text-blue-800" onClick={handleOpenPasswordModal}>
                  Change
                </button>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Last Password Change</p>
                <p className="text-sm font-medium text-gray-800">{user.lastPasswordChange ? new Date(user.lastPasswordChange).toLocaleString() : '-'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Password Modal */}
        <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} className="max-w-[400px] m-4">
          <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 p-4">
            <h4 className="text-lg font-semibold mb-2">Change Password</h4>
            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={e => setPasswordForm(f => ({ ...f, newPassword: e.target.value }))}
              className="border p-2 rounded"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm(f => ({ ...f, confirmPassword: e.target.value }))}
              className="border p-2 rounded"
              required
            />
            {passwordError && <div className="text-red-600 text-sm">{passwordError}</div>}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowPasswordModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Update</button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
}
 