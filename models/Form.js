const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  answerText: { type: String, default: '' },
});

const sectionSchema = new mongoose.Schema({
  subheading: { type: String, default: '' },
  questions: [questionSchema],
});

const formSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image: { type: String }, // Store the image URL
  sections: [sectionSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Form', formSchema);