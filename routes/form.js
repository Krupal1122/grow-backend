const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// POST: Save Blog data to MongoDB
router.post('/', async (req, res) => {
  try {
    const BlogData = req.body;
    const newBlog = new Blog(BlogData);
    await newBlog.save();
    res.status(201).json({ message: 'Blog data saved successfully', Blog: newBlog });
  } catch (error) {
    res.status(500).json({ message: 'Error saving Blog data', error: error.message });
  }
});

// GET: Retrieve all Blogs (optional, for testing)
router.get('/', async (req, res) => {
  try {
    const Blogs = await Blog.find();
    res.status(200).json(Blogs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving Blogs', error: error.message });
  }
});

module.exports = router;