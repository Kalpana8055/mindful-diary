import React, { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [updatedName, setUpdatedName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [newProfilePic, setNewProfilePic] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users/me", {
          headers: { Authorization: token },
        });
        setUser(res.data);
        setUpdatedName(res.data.name);
        setUpdatedEmail(res.data.email);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data", err);
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  // Handle profile update
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("name", updatedName);
      formData.append("email", updatedEmail);
      if (newProfilePic) formData.append("profilePic", newProfilePic);

      await axios.put("http://localhost:5000/users/me", formData, {
        headers: { Authorization: token, "Content-Type": "multipart/form-data" },
      });

      alert("✅ Profile updated successfully!");
      setEditMode(false);
      window.location.reload();
    } catch (err) {
      console.error("Error updating profile", err);
      alert("❌ Failed to update profile.");
    }
  };

  // Handle profile delete
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "⚠️ Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      await axios.delete("http://localhost:5000/users/me", {
        headers: { Authorization: token },
      });
      localStorage.removeItem("token");
      alert("🗑️ Profile deleted successfully.");
      window.location.href = "/register";
    } catch (err) {
      console.error("Error deleting profile", err);
      alert("❌ Failed to delete profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div
      className="card"
      style={{
        background: "linear-gradient(135deg, #fce4ec, #e1f5fe)",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        maxWidth: "400px",
        margin: "50px auto",
        textAlign: "center",
      }}
    >
      <h2>👤 Profile</h2>
      {user.profilePic && (
        <img
          src={`http://localhost:5000/${user.profilePic}`}
          alt="Profile"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            marginBottom: "10px",
          }}
        />
      )}

      {editMode ? (
        <>
          <input
            type="text"
            placeholder="Name"
            value={updatedName}
            onChange={(e) => setUpdatedName(e.target.value)}
            style={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            value={updatedEmail}
            onChange={(e) => setUpdatedEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="file"
            onChange={(e) => setNewProfilePic(e.target.files[0])}
            style={{ margin: "10px 0" }}
          />
          <button style={btnStyle} onClick={handleUpdate}>
            ✅ Save Changes
          </button>
          <button
            style={{ ...btnStyle, backgroundColor: "#f06292" }}
            onClick={() => setEditMode(false)}
          >
            ❌ Cancel
          </button>
        </>
      ) : (
        <>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button style={btnStyle} onClick={() => setEditMode(true)}>
            ✏️ Edit Profile
          </button>
          <button
            style={{ ...btnStyle, backgroundColor: "#ef5350" }}
            onClick={handleDelete}
          >
            🗑️ Delete Profile
          </button>
        </>
      )}
    </div>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  margin: "8px 0",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const btnStyle = {
  padding: "10px 20px",
  margin: "5px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#64b5f6",
  color: "#fff",
  cursor: "pointer",
};

export default Profile;
