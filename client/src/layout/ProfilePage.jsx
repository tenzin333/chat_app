import React, { useContext, useState ,useEffect} from "react";
import assets from "@assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    userName: "",
    bio: "",
    profilePic: null, // actual File object
  });

  const [profilePic, setProfilePic] = useState(assets.avatar_icon); // preview image
  const { authUser, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  // handle text/bio input
  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // handle image input
  const onImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file)); // preview
      setFormData((prev) => ({
        ...prev,
        profilePic: file, // store the File object
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // If no new image was uploaded, update only text data
    if (!formData.profilePic || !(formData.profilePic instanceof File)) {
      updateProfile({ userName: formData.userName, bio: formData.bio });
      navigate("/");
      return;
    }

    // Convert File -> Base64
    const reader = new FileReader();

    reader.onload = () => {
      const base64Image = reader.result;
      updateProfile({
        userName: formData.userName,
        bio: formData.bio,
        profilePic: base64Image,
      });
      navigate("/");
    };

    reader.onerror = () => {
      console.error("Error reading file");
      // Optionally show error to user
    };

    reader.readAsDataURL(formData.profilePic);
  };

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      userName: authUser?.userName || "",
      bio: authUser?.bio || "",
    }));
    if (authUser?.profilePic) {
      setProfilePic(authUser.profilePic); // use saved profile pic if available
    }
  }, [authUser]);

  return (
    <div className="flex justify-center items-center min-h-screen w-full px-4">
      <div className="flex flex-col md:flex-row justify-between items-center 
                      w-full max-w-2xl backdrop-blur-xl border rounded-2xl p-6 gap-6">

        {/* Profile Form */}
        <div className="flex flex-col gap-4 flex-1">
          <h2 className="text-xl font-semibold">Profile details</h2>
          <form onSubmit={onSubmit} className="flex flex-col w-full gap-3">

            <input
              className="border rounded-md p-2"
              name="userName"
              type="text"
              value={formData.userName}
              onChange={onChange}
              placeholder="Enter your display name"
              required
            />

            <textarea
              className="border rounded-md p-2"
              name="bio"
              rows={6}
              value={formData.bio}
              onChange={onChange}
              placeholder="Write something about yourself..."
            />

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
              src={profilePic}
              className="w-32 h-32 rounded-full object-cover border"
              alt="Profile"
            />
            <input
              id="profilePic"
              type="file"
              accept="image/*"
              onChange={onImageChange}   // ✅ fixed
              className="hidden"
            />
            <label
              htmlFor="profilePic"
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