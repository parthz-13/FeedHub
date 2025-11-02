import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import prisma from "./db.config.js";
import { generateToken, hashPassword, comparePassword, protect } from "./auth.js";

dotenv.config();
const app = express();
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());
const PORT = process.env.PORT || 5020;


app.get("/", (req, res) => {
  res.send("Feedback Board API Running");
});

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: "User exists" });

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get("/api/feedback", async (req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: { user: { select: { name: true } }, _count: { select: { comments: true } } },
      orderBy: { upvotes: "desc" },
    });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/feedback", protect, async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const fb = await prisma.feedback.create({
      data: { title, description, category, userId: req.user.id },
    });
    res.status(201).json(fb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/feedback/:id/upvote", protect, async (req, res) => {
  const feedbackId = parseInt(req.params.id);
  try {
    const existing = await prisma.vote.findUnique({
      where: { userId_feedbackId: { userId: req.user.id, feedbackId } },
    });
    if (existing) {
      await prisma.vote.delete({ where: { id: existing.id } });
      await prisma.feedback.update({ where: { id: feedbackId }, data: { upvotes: { decrement: 1 } } });
      return res.json({ message: "Upvote removed" });
    } else {
      await prisma.vote.create({ data: { userId: req.user.id, feedbackId } });
      await prisma.feedback.update({ where: { id: feedbackId }, data: { upvotes: { increment: 1 } } });
      return res.json({ message: "Upvoted!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get("/api/comments/:feedbackId", async (req, res) => {
  const feedbackId = parseInt(req.params.feedbackId);
  try {
    const comments = await prisma.comment.findMany({
      where: { feedbackId },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/comments/:feedbackId", protect, async (req, res) => {
  const feedbackId = parseInt(req.params.feedbackId);
  const { content } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: { content, feedbackId, userId: req.user.id },
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));