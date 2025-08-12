const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
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

const Formschema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String },
  sections: [sectionSchema],
  createdAt: { type: Date, default: Date.now },
});

const Blog = mongoose.model('Blog', Formschema);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
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

app.post('/api/Forms', async (req, res) => {
  try {
    const BlogData = req.body;
    const newBlog = new Blog(BlogData);
    await newBlog.save();
    res.status(201).json({ message: 'Blog data saved successfully', Blog: newBlog });
  } catch (error) {
    res.status(500).json({ message: 'Error saving Blog data', error: error.message });
  }
});

app.get('/api/Forms', async (req, res) => {
  try {
    const Forms = await Blog.find();
    res.status(200).json(Forms);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Forms', error: error.message });
  }
});

app.use('/uploads', express.static('uploads'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});