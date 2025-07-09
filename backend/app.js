const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/mindful-diary", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// Multer setup for profile pic upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Models
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  profilePic: String,
});
const diarySchema = new mongoose.Schema({
  userId: String,
  entry: String,
  mood: String,
  date: { type: Date, default: Date.now },
});
const User = mongoose.model("User", userSchema);
const Diary = mongoose.model("Diary", diarySchema);

// Routes

/**
 * 📝 Register User
 */
app.post("/users/register", upload.single("profilePic"), async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "This email is already registered. Please login." });
    }

    const profilePic = req.file ? req.file.path : "uploads/default.png";
    const user = new User({ name, email, password, profilePic });
    await user.save();
    res.json({ message: "✅ User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "❌ Registration failed" });
  }
});

/**
 * 🔐 Login User
 */
app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });
    res.json({ message: "✅ Login successful", token: user._id });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "❌ Login failed" });
  }
});

/**
 * 👤 Get Current User Profile
 */
app.get("/users/me", async (req, res) => {
  try {
    const user = await User.findById(req.headers.authorization);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "❌ Fetch user failed" });
  }
});

/**
 * ✏️ Update User Profile
 */
app.put("/users/me", upload.single("profilePic"), async (req, res) => {
  try {
    const userId = req.headers.authorization;
    const { name, email } = req.body;

    const updatedData = { name, email };
    if (req.file) {
      updatedData.profilePic = req.file.path;
    }

    await User.findByIdAndUpdate(userId, updatedData, { new: true });
    res.json({ message: "✅ Profile updated successfully" });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "❌ Failed to update profile" });
  }
});

/**
 * 🗑️ Delete User Profile
 */
app.delete("/users/me", async (req, res) => {
  try {
    const userId = req.headers.authorization;
    await User.findByIdAndDelete(userId);
    res.json({ message: "✅ User deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "❌ Failed to delete user" });
  }
});

/**
 * 📓 Add Diary Entry
 */
app.post("/diary", async (req, res) => {
  try {
    const { entry, mood } = req.body;
    const userId = req.headers.authorization;
    const diary = new Diary({ userId, entry, mood });
    await diary.save();
    res.json({ message: "✅ Entry saved" });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to save entry" });
  }
});

/**
 * 📓 Get Diary Entries
 */
app.get("/diary", async (req, res) => {
  try {
    const userId = req.headers.authorization;
    const entries = await Diary.find({ userId });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to fetch entries" });
  }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));
