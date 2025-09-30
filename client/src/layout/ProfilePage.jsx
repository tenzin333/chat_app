import React, { useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    profileImage: null
  });
  const [profileImage, setProfileImage] = useState(assets.avatar_icon); // default image
  const navigate = useNavigate();
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file)); // preview
      onChange(e);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    navigate("/")
    // send formData + profileImage (file) to backend
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full px-4">
      <div className="flex flex-col md:flex-row justify-between items-center 
                      w-full max-w-2xl backdrop-blur-xl border rounded-2xl p-6 gap-6">
        
        {/* Profile Form */}
        <div className="flex flex-col gap-4 flex-1">
          <h2 className="text-xl font-semibold">Profile details</h2>
          <form onSubmit={onSubmit} className="flex flex-col w-full gap-3">
            
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Display Name</span>
              <input
                className="border rounded-md p-2"
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={onChange}
                placeholder="Enter your display name"
                required
              />
            </label>
            
            <label className="flex flex-col gap-1">
              <span className="text-sm text-gray-600">Bio</span>
              <textarea
                className="border rounded-md p-2"
                name="bio"
                rows={6}
                value={formData.bio}
                onChange={onChange}
                placeholder="Write something about yourself..."
              />
            </label>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 
                         hover:from-blue-600 hover:to-green-600 
                         rounded-md p-2 text-white font-medium"
            >
              Save
            </button>
          </form>
        </div>

        {/* Profile Image Uploader */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <img
              src={profileImage}
              className="w-32 h-32 rounded-full object-cover border"
              alt="Profile"
            />
            {/* Hidden input */}
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="hidden"
            />
            {/* Upload button overlay */}
            <label
              htmlFor="profileImage"
              className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-blue-600"
            >
              Edit
            </label>
          </div>
          <p className="text-sm text-gray-500">Click "Edit" to upload</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
