// require all packages
const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

// Require models.
const models = require("../models");

// connect to the mongo database on local or heroku
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/media-net";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
const db = mongoose.connection;

// Check for a connection.
db.once("open", () => {
  console.log(`connect to ${MONGODB_URI}`);
});

// Checking for errors.
db.on("error", (err) => {
  console.log("Database error: ", err);
});

// Redirects the user to the login page from root.
router.get("/", (req, res) => {
  res.redirect("/scrape");
});

// route to articles
router.get("/articles", function (req, res) {
  models.Article.find().sort({ id: -1 })
    .exec(function (err, articalData) {
      if (err) {
        console.log(err);
      } else {
        const hbsObject = { articles: articalData };
        res.render("index", hbsObject);
      }
    });
});

// route to saved articles
router.get("/saved", function (req, res) {
  models.Saved.find().sort({ id: -1 })
    .exec(function (err, savedData) {
      if (err) {
        console.log(err);
      } else {
        const hbsObject = { saved: savedData };
        res.render("saved", hbsObject);
      }
    });
});

// Where the scraping happens...
router.get("/scrape", function (req, res) {
  // Grabbing the site"s content with axios.
  axios.get("https://sciworthy.com/category/sciencenews/computer-science/").then(function (response) {
    // Loading the cannon...
    const $ = cheerio.load(response.data);

    $(".entry-header").each(function (_i, _element) {
      const result = {};

      result.title = $(this)
        .find("span.entry-title-primary")
        .text()
      result.summary = $(this)
        .find("span.entry-subtitle").text()
      result.link = $(this)
        .children("a")
        .attr("href")

      // Create a new article for each result.
      models.Article.create(result)
        .then(function (dbArticle) {
          console.log(dbArticle);
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    // Redirect to the articles page.
    res.redirect("./articles");
  });
});

// A route to remove all scraped articles.
router.get("/clear", function (req, res) {
  db.collection("articles").deleteMany({});
  res.redirect("/articles");
});

// A route to save articles.
router.get("/save/:id", function (req, res) {
  models.Article.findById(req.params.id)
    .exec(function (err, articalData) {
      if (err) {
        console.log(err);
      } else {
        console.log(articalData);

        const savingData = {};

        savingData.title = articalData.title;
        savingData.summary = articalData.summary;
        savingData.link = articalData.link;

        console.log(savingData);
        models.Saved.create(savingData)
          .then(function (confirm) {
            console.log(confirm);
          })
          .catch(function (error) {
            console.log(error);
          });
        res.redirect("/articles");
      }
    });
});

// A route to remove all saved articles.
router.get("/clear-all", function (req, res) {
  db.collection("saveds").deleteMany({});
  console.log("Everything is gone...");
  res.redirect("/saved");
});

// A route to remove one saved article.
router.get("/delete-one/:id", function (req, res) {
  models.Saved.findOneAndDelete({ _id: req.params.id })
    .then((doc) => {
      console.log(doc);
      res.redirect("/saved");
    });
});

// A route to add a note to an article.
router.post("/note/:id", function (req, res) {
  console.log(req.body.noteId);
  models.Saved.findOneAndUpdate({ _id: req.params.id }, { note: req.body.noteId })
    .then((doc) => {
      console.log(req.params.id);
      console.log(doc);
      res.redirect("/saved");
    });
});

// A route to delete a note to an article.
router.get("/delete-note/:id", function (req, res) {
  models.Saved.findOneAndUpdate({ _id: req.params.id }, { note: "" })
    .then((doc) => {
      console.log(req.params.id);
      console.log(doc);
      res.redirect("/saved");
    });
});

module.exports = router;