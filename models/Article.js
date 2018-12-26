const mongoose = require('mongoose');

// eslint-disable-next-line prefer-destructuring
const Schema = mongoose.Schema;

const ArticleSchema = new Schema({
  // Title of each article.
  title: {
    type: String,
    required: true,
  },
  // Summary for each article.
  summary: {
    type: String,
    required: true,
  },
  // Link to each article.
  link: {
    type: String,
    required: true,
  },
});

const Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
