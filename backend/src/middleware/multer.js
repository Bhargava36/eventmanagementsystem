const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();

// Main uploads folder
const uploadFolder = path.join(__dirname, "uploads");

// Folder lekapothe create chestundi
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        let folder = "others";

        if (file.mimetype.startsWith("image/")) {
            folder = "images";
        }
        else if (file.mimetype === "application/pdf") {
            folder = "pdfs";
        }
        else if (file.mimetype.startsWith("text/")) {
            folder = "documents";
        }

        const folderPath = path.join(uploadFolder, folder);

        // Sub-folder lekapothe create chestundi
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        cb(null, folderPath);
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {

    res.json({
        message: "File uploaded successfully",
        file: req.file
    });

});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});