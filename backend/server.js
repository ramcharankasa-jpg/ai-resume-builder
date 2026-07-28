require("dotenv").config();
const express = require("express");
const cors = require("cors");

const resumeRoutes = require("./routes/resume");
const aiRoutes = require("./routes/ai");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "*"
  })
);
app.use(express.json());

// Health check (useful for Render)
app.get("/", (req, res) => {
  res.json({ status: "AI Resume Builder API is running" });
});

app.use("/api/resume", resumeRoutes);
app.use("/api/ai", aiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
