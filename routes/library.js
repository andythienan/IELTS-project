const express = require("express");
const router = express.Router();

// Middleware
const checkAuthenticated = (req, res, next) =>
  req.isAuthenticated() ? next() : res.redirect("/account/login");

const lessons = {
    grammar: [
      {
        id: 1,
        title: "Parts of Speech",
        url: "/lesson/lesson1",
        available: true,
      },
      {
        id: 2,
        title: "Tenses",
        url: "/lesson/lesson2",
        available: true,
      },
      {
        id: 3,
        title: "Clauses",
        available: false,
      },
    ],
    vocabulary: [
        {
            id: 4,
            title: "Synonyms and Antonyms",
            url: "/lesson/lesson4",
            available: true,
          },
          {
            id: 5,
            title: "Word Families",
            available: false,
          },
          {
            id: 6,
            title: "Prefixes and Suffixes",
            available: false,
          },
    ]
  };
  
  const exams = {
    listening: [
        {
            id: 1,
            title: "Test 1",
            url: "/listening/listening1",
            pdfUrl: "/files/listening_pdf/listening1.pdf",
            available: true
        },
        {
            id: 2,
            title: "Test 2",
            url: "/listening/listening2",
            pdfUrl: "/files/listening_pdf/listening2.pdf",
            available: true
        },
        {
            id: 3,
            title: "Test 3",
            url: "/listening/listening3",
            pdfUrl: "/files/listening_pdf/listening3.pdf",
            available: true
        },
        {
          id: 3,
          title: "Test 4",
          url: "/listening/listening4",
          pdfUrl: "/files/listening_pdf/listening4.pdf",
          available: false
      }
    ],
    reading: [
        {
            id: 1,
            title: "Test 1",
            url: "/reading/reading1",
            pdfUrl: "/files/reading_pdf/reading1.pdf",
            available: true
        },
        {
            id: 2,
            title: "Test 2",
            url: "/reading/reading2",
            pdfUrl: "/files/reading_pdf/reading2.pdf",
            available: true
        },
        {
            id: 3,
            title: "Test 3",
            url: "/reading/reading3",
            pdfUrl: "/files/reading_pdf/reading3.pdf",
            available: true
        }
    ],
    writing: [
        {
            id: 1,
            title: "Test 1",
            url: "/writing/writing1",
            pdfUrl: "/files/writing_pdf/writing1.pdf",
            available: true
        },
        {
            id: 2,
            title: "Test 2",
            url: "/writing/writing2",
            pdfUrl: "/files/writing_pdf/writing2.pdf",
            available: true
        },
        {
            id: 3,
            title: "Test 3",
            url: "/writing/writing3",
            pdfUrl: "/files/writing_pdf/writing3.pdf",
            available: true
        }
    ],
    speaking: [
        {
          id: 1,
          title: "Test 1",
          available: false
        },
        {
          id: 2,
          title: "Test 2",
          available: false
        },
        {
          id: 3,
          title: "Test 3",
          available: false
        }
    ]
  }


// Library Route
router.get("/", checkAuthenticated, (req, res) => {
    const type = req.query.type;
    const data = type === 'exam' ? exams : lessons;
    res.render("library.ejs", {
      type: type,
      name: req.user?.name || null,
      data: data
    });
  });
  
module.exports = router;