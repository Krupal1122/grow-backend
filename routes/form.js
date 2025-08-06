const express = require('express');
const router = express.Router();
const Form = require('../models/Form');

// POST: Save form data to MongoDB
router.post('/', async (req, res) => {
  try {
    const formData = req.body;
    const newForm = new Form(formData);
    await newForm.save();
    res.status(201).json({ message: 'Form data saved successfully', form: newForm });
  } catch (error) {
    res.status(500).json({ message: 'Error saving form data', error: error.message });
  }
});

// GET: Retrieve all forms (optional, for testing)
router.get('/', async (req, res) => {
  try {
    const forms = await Form.find();
    res.status(200).json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving forms', error: error.message });
  }
});

module.exports = router;