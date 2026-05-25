import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import postRoutes from "./routes/posts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Explicitly configured to allow all cross-origin requests
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Routes
app.use("/api/posts", postRoutes);

app.get("/", (_, res) => res.send("Blog API running ✓"));

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://mongodb:27017/blog")
  .then(() => {
    console.log("MongoDB connected ✓");
    // Explicitly bind to '0.0.0.0' to accept external requests on your AWS EC2 instance
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT} ✓`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));