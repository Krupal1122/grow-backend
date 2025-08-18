const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adjust if your frontend runs on a different port
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Create uploads directory if it doesn't exist
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Configure Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, gif) are allowed!'));
    }
  },
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Project Schema
const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  platform: { type: String, required: true },
  category: { type: String, required: true },
  liveView: { type: String, required: true },
  timelines: { type: String, required: true },
  services: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Project = mongoose.model('Project', projectSchema);

// Blog Schema (from your provided code)
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  answerText: { type: String, default: '' },
});

const sectionSchema = new mongoose.Schema({
  subheading: { type: String, default: '' },
  questions: [questionSchema],
});

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  sections: [sectionSchema],
  createdAt: { type: Date, default: Date.now },
});

const Blog = mongoose.model('Blog', blogSchema);

// Routes
const router = express.Router();

// --- Project Routes ---

// POST: Create a new project
router.post('/projects', async (req, res) => {
  try {
    console.log('Received project data:', req.body); // Debug log
    const { title, image, platform, category, liveView, timelines, services } = req.body;

    if (!title || !image || !platform || !category || !liveView || !timelines || !services) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const project = new Project({
      title: title.trim(),
      image,
      platform: platform.trim(),
      category: category.trim(),
      liveView: liveView.trim(),
      timelines: timelines.trim(),
      services: services.trim(),
    });

    await project.save();
    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Error saving project data', error: error.message });
  }
});

// GET: Retrieve all projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error retrieving projects:', error);
    res.status(500).json({ message: 'Error retrieving projects', error: error.message });
  }
});

// GET: Retrieve a single project by ID
router.get('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error('Error retrieving project:', error);
    res.status(500).json({ message: 'Error retrieving project', error: error.message });
  }
});

// PUT: Update a project by ID
router.put('/projects/:id', async (req, res) => {
  try {
    console.log('Received update project data:', req.body); // Debug log
    const { id } = req.params;
    const { title, image, platform, category, liveView, timelines, services } = req.body;

    if (!title || !image || !platform || !category || !liveView || !timelines || !services) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        image,
        platform: platform.trim(),
        category: category.trim(),
        liveView: liveView.trim(),
        timelines: timelines.trim(),
        services: services.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

// DELETE: Delete a project by ID
router.delete('/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

// --- Blog Routes (from your provided code) ---

// POST: Save Blog data
router.post('/forms', async (req, res) => {
  try {
    console.log('Received blog data:', req.body); // Debug log
    const blogData = req.body;

    if (!blogData.title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!blogData.sections || !Array.isArray(blogData.sections)) {
      return res.status(400).json({ message: 'Sections are required and must be an array' });
    }

    const newBlog = new Blog(blogData);
    await newBlog.save();
    res.status(201).json({ message: 'Blog data saved successfully', blog: newBlog });
  } catch (error) {
    console.error('Error saving blog:', error);
    res.status(500).json({ message: 'Error saving blog data', error: error.message });
  }
});

// GET: Retrieve all Blogs
router.get('/forms', async (req, res) => {
  try {
    const forms = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(forms);
  } catch (error) {
    console.error('Error retrieving forms:', error);
    res.status(500).json({ message: 'Error retrieving forms', error: error.message });
  }
});

// GET: Retrieve a single Blog by ID
router.get('/forms/:id', async (req, res) => {
  try {
    const form = await Blog.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.status(200).json(form);
  } catch (error) {
    console.error('Error retrieving form:', error);
    res.status(500).json({ message: 'Error retrieving form', error: error.message });
  }
});

// PUT: Update a Blog by ID
router.put('/forms/:id', async (req, res) => {
  try {
    console.log('Received update blog data:', req.body); // Debug log
    const { id } = req.params;
    const blogData = req.body;
    const updatedBlog = await Blog.findByIdAndUpdate(id, blogData, {
      new: true,
      runValidators: true,
    });
    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ message: 'Blog updated successfully', blog: updatedBlog });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
});

// DELETE: Delete a Blog by ID
router.delete('/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Error deleting blog', error: error.message });
  }
});

// File Upload Route
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Use router for API routes
app.use('/api', router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err.message.includes('Only images')) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});