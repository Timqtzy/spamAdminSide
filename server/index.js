require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const fileUpload = require("express-fileupload");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(cors());
app.use(fileUpload({ useTempFiles: true }));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected successfully");
    await createAdminUser();
  })
  .catch((err) => console.error("MongoDB connection error:", err.message));

// Schemas
const CardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    author: { type: String, required: true },
    readTime: { type: String, required: true },
  },
  { timestamps: true, collection: "cards" }
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { collection: "users" }
);

// Models
const Card = mongoose.model("Card", CardSchema);
const User = mongoose.model("User", UserSchema);

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(verified._id);
    if (!req.user) return res.status(401).json({ error: "User not found" });
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// Routes
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// CRUD for Cards
app.get("/api/cards", authenticate, async (req, res) => {
  try {
    console.log(process.env.JWT_SECRET);
    const cards = await Card.find();
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cards." });
  }
});

app.post("/api/cards", authenticate, async (req, res) => {
  try {
    const { title, content, category, author, readTime } = req.body;
    const { image } = req.files || {};

    if (!title || !content || !category || !author || !readTime || !image) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const uploadResponse = await cloudinary.uploader.upload(
      image.tempFilePath,
      { folder: "cards" }
    );

    const newCard = new Card({
      title,
      slug,
      content,
      category,
      author,
      readTime,
      image: uploadResponse.secure_url,
    });

    await newCard.save();
    res.json(newCard);
  } catch (error) {
    res.status(500).json({ error: "Failed to add card." });
  }
});

app.put("/api/cards/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, author, readTime } = req.body;
    const updateData = { title, content, category, author, readTime };

    if (req.files?.image) {
      const uploadResponse = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        { folder: "cards" }
      );
      updateData.image = uploadResponse.secure_url;
    }

    if (title) {
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }

    const updatedCard = await Card.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCard) return res.status(404).json({ error: "Card not found." });

    res.json(updatedCard);
  } catch (error) {
    res.status(500).json({ error: "Failed to update card." });
  }
});

app.delete("/api/cards/:id", authenticate, async (req, res) => {
  try {
    const deletedCard = await Card.findByIdAndDelete(req.params.id);

    if (!deletedCard) return res.status(404).json({ error: "Card not found." });

    res.json({ message: "Card deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete card." });
  }
});

// Admin user creation
const createAdminUser = async () => {
  if (!(await User.findOne({ username: "admin" }))) {
    await User.create({
      username: "admin",
      password: await bcrypt.hash("admin123", 8),
      role: "admin",
    });
    console.log("Admin user created");
  }
};

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
