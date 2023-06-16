const express = require("express");
const path = require("path");
const app = express();

const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const notesFilePath = "./db/db.json";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const PORT = process.env.PORT || 3001;

app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);
app.get("/notes", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/notes.html"))
);
app.get("/api/notes", (req, res) => {
  fs.readFile(notesFilePath, "utf8", (err, noteData) => {
    if (err) {
      console.log(err);
      res.status(500).json([{}]);
    } else {
      res.json(JSON.parse(noteData));
    }
  });
});
app.post("/api/notes", (req, res) => {
  const { title, text } = req.body;
  if (title && text) {
    fs.readFile(notesFilePath, "utf8", (error, noteData) => {
      if (error) {
        console.log(error);
        res.status(500).json([{}]);
      } else {
        const notes = JSON.parse(noteData);
        const newNote = {
          title,
          text,
          id: uuidv4(),
        };
        notes.push(newNote);
        fs.writeFile(notesFilePath, JSON.stringify(notes, null, 4), (error) =>
          error
            ? console.error(error)
            : console.info(`\nData written to ${notesFilePath}`)
        );
        const response = {
          status: "success",
          body: newNote,
        };
        res.json(response);
      }
    });
  }
});
app.delete("/api/notes/:noteId", (req, res) => {
  if (req.params.noteId) {
    const noteIdToDelete = req.params.noteId;
    console.log(noteIdToDelete);
    fs.readFile(notesFilePath, "utf8", (error, noteData) => {
      if (error) {
        res.status(500).json([{}]);
      } else {
        const notes = JSON.parse(noteData);
        const notesToRetain = notes.filter((note) => note.id != noteIdToDelete);
        fs.writeFile(
          notesFilePath,
          JSON.stringify(notesToRetain, null, 4),
          (error) =>
            error
              ? console.error(error)
              : console.info(`\nData written to ${notesFilePath}`)
        );
        const response = {
          status: "success",
        };
        res.json(response);
      }
    });
  }
});
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/public/index.html"))
);
app.listen(PORT, () => console.log(`listenin on http://localhost:${PORT}`));
