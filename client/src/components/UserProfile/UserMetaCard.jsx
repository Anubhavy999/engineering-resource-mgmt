import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useState, useEffect } from "react";

export default function UserMetaCard({ user, onSave }) {
  console.log("UserMetaCard user prop:", user);
  const { isOpen, openModal, closeModal } = useModal();
  const [form, setForm] = useState({
    name: user.name || "",
    role: user.role || "",
    // Add social links if you want to support them
    // facebook: user.facebook || "",
    // x: user.x || "",
    // linkedin: user.linkedin || "",
    // instagram: user.instagram || ""
  });

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: user.name || "",
        role: user.role || "",
        // facebook: user.facebook || "",
        // x: user.x || "",
        // linkedin: user.linkedin || "",
        // instagram: user.instagram || ""
      });
    }
  }, [isOpen, user]);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSave = (e) => {
    e.preventDefault();
    onSave(form);
    closeModal();
  };
  // Get initials from user name
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';
  const cityCountry = [user.city, user.country].filter(Boolean).join(", ");
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 flex items-center justify-center bg-blue-100 text-blue-700 text-3xl font-bold rounded-full border border-gray-200 dark:border-gray-800">
              {initials}
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.name || "User Name"}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role || "Role"}
                </p>
                {cityCountry && (
                  <>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{cityCountry}</p>
                  </>
                )}
              </div>
            </div>
            {/* Social links can be added here if you want */}
          </div>
          {/* Removed edit button for display card as role is managed by RBAC */}
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Edit Display Info</h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">Update your display name and role.</p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="custom-scrollbar h-[250px] overflow-y-auto px-2 pb-3">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div className="col-span-2 lg:col-span-1">
                  <Label>Name</Label>
                  <Input name="name" type="text" value={form.name} onChange={handleChange} />
                </div>
                  <div className="col-span-2 lg:col-span-1">
                  <Label>Role</Label>
                  <Input name="role" type="text" value={form.role} onChange={handleChange} />
                </div>
                {/* Add social links here if you want */}
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">Close</Button>
              <Button size="sm" type="submit">Save Changes</Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
