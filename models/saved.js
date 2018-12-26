const mongoose = require('mongoose');

// eslint-disable-next-line prefer-destructuring
const Schema = mongoose.Schema;

const SavedSchema = new Schema({
  // Title of each saved article.
  title: {
    type: String,
    required: true,
  },
  // Summary for each saved article.
  summary: {
    type: String,
    required: true,
  },
  // Link to each saved article.
  link: {
    type: String,
    required: true,
  },
  // Note to each saved article.
  note: {
    type: String,
    required: false,
  },
});

const Saved = mongoose.model('Saved', SavedSchema);

module.exports = Saved;
