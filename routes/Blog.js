const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// POST: Save Blog data
router.post('/', async (req, res) => {
  try {
    const blogData = req.body;
    const newBlog = new Blog(blogData);
    await newBlog.save();
    res.status(201).json({ message: 'Blog data saved successfully', blog: newBlog });
  } catch (error) {
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

module.exports = router;