const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adjust based on your frontend URL
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
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// MongoDB Schema
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  answerText: { type: String, default: '' },
});

const sectionSchema = new mongoose.Schema({
  subheading: { type: String, default: '' },
  questions: [questionSchema],
});

const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String }, // Store the image URL
  sections: [sectionSchema],
  createdAt: { type: Date, default: Date.now },
});

const Blog = mongoose.model('Blog', FormSchema);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const router = express.Router();

// POST: Save Blog data
router.post('/', async (req, res) => {
  try {
    const blogData = req.body;
    console.log('Received blog data:', blogData); // Debug log

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
    console.error('Error saving blog:', error); // Detailed error log
    res.status(500).json({ message: 'Error saving blog data', error: error.message });
  }
});

// GET: Retrieve all Forms
router.get('/', async (req, res) => {
  try {
    const forms = await Blog.find();
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving forms', error: error.message });
  }
});

// GET: Retrieve a single Form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await Blog.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.status(200).json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving form', error: error.message });
  }
});

// PUT: Update a Blog by ID
router.put('/:id', async (req, res) => {
  try {
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
    res.status(500).json({ message: 'Error updating blog', error: error.message });
  }
});

// DELETE: Delete a Blog by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlog = await Blog.findByIdAndDelete(id);
    if (!deletedBlog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.status(200).json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting blog', error: error.message });
  }
});

app.use('/api/forms', router);

// File Upload Route
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

app.use('/uploads', express.static('uploads'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = router; // This line can be removed if not exporting router separately