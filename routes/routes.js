// require all packages
const express = require("express");
const router = express.Router();
const axios = require("axios");
const cheerio = require("cheerio");
const mongoose = require("mongoose");

// Require models.
const models = require("../models");

// connect to the mongo database on local or heroku
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sci-net";
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

// route to scrape site for articles
router.get("/scrape", function(req, res) {
    axios.get("https://sciworthy.com/category/sciencenews/computer-science/")
        .then(function(response) {
            const $ = cheerio.load(response.data);
            $(".entry-header").each(function(_i, _element) {
                const result = {};
                // scrapes article by span and class
                result.title = $(this)
                    .find("span.entry-title-primary")
                    .text()
                result.summary = $(this)
                    .find("span.entry-subtitle").text()
                result.link = $(this)
                    .children("a")
                    .attr("href")
                // sets new articel
                models.Article.create(result)
                    .then((dbArticle) => {
                        console.log(dbArticle);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            });
            res.redirect("./articles")
        });
});

// A route to save articles.
router.get("/save/:id", (req, res) => {
    models.Article.findById(req.params.id)
        .exec((err, articleData) => {
            if (err) {
                console.log(err);
            } else {
                console.log(articleData);

                const savedData = {};

                savedData.title = articleData.title;
                savedData.summary = articleData.summary;
                savedData.link = articleData.link;

                console.log(savedData);
                models.Saved.create(savedData)
                    .then((confirm) => {
                        console.log(confirm);
                    })
                    .catch((error) => {
                        console.log(error);
                    });
                res.redirect("/articles");
            }
        });
});


// route to get articles
router.get("/articles", (req, res) => {
    models.Article.find().sort({ id: -1 })
        .then((articleData) => {
            const hbsObject = { article: articleData }
            res.render("index", hbsObject);
        })
        .catch((err) => {
            res.render("index", err);
        });
});

// route to get articles
router.get("/saved", (req, res) => {
    models.Saved.find().sort({ id: -1 })
        .then((savedData) => {
            const hbsObject = { saved: savedData }
            res.render("saved", hbsObject);
        })
        .catch((err) => {
            res.render("saved", err);
        });
});

// A route to remove all saved articles.
router.get("/clear-all",(req, res) => {
    db.collection("saveds").deleteMany({});
    console.log("Cleared all articles");
    res.redirect("/saved");
});

// A route to remove one saved article.
router.get("/delete-one/:id",(req, res) => {
    models.Saved.findOneAndDelete({ _id: req.params.id })
        .then((doc) => {
            console.log(doc);
            res.redirect("/saved");
        });
});

// A route to add a note to an article.
router.post("/note/:id",(req, res) => {
    console.log(req.body.noteId);
    models.Saved.findOneAndUpdate({ _id: req.params.id }, { note: req.body.noteId })
        .then((doc) => {
            console.log(req.params.id);
            console.log(doc);
            res.redirect("/saved");
        });
});

// A route to delete a note to an article.
router.get("/delete-note/:id",(req, res) => {
    models.Saved.findOneAndUpdate({ _id: req.params.id }, { note: "" })
        .then((doc) => {
            console.log(req.params.id);
            console.log(doc);
            res.redirect("/saved");
        });
});

// A route to remove all scraped articles.
router.get("/clear", function (req, res) {
    db.collection("articles").deleteMany({});
    res.redirect("/articles");
  });

module.exports = router;


