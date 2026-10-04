const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Main uploads folder inside backend root (backend/uploads)
const uploadFolder = path.resolve(__dirname, "../../uploads");

// Sub-folders to organize files
const subFolders = ["images", "pdfs", "documents", "others"];

// Create main uploads directory if it doesn't exist
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Create sub-directories if they don't exist
subFolders.forEach((sub) => {
    const subPath = path.join(uploadFolder, sub);
    if (!fs.existsSync(subPath)) {
        fs.mkdirSync(subPath, { recursive: true });
    }
});

// Storage configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let folder = "others";

        if (file.mimetype.startsWith("image/")) {
            folder = "images";
        } else if (file.mimetype === "application/pdf") {
            folder = "pdfs";
        } else if (file.mimetype.startsWith("text/")) {
            folder = "documents";
        }

        const folderPath = path.join(uploadFolder, folder);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        cb(null, folderPath);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const safeName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
        cb(null, `${Date.now()}-${safeName}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

/**
 * Helper to save Base64 data string as a physical file in uploads folder.
 * Returns the public URL (e.g. http://localhost:3000/uploads/images/filename.ext).
 * If the input is already a URL or not base64, returns it unchanged.
 */
const saveBase64File = (base64Str, defaultSubfolder = "images") => {
    if (!base64Str || typeof base64Str !== "string") return base64Str;

    const matches = base64Str.match(/^data:([A-Za-z0-9-+\/.]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return base64Str;
    }

    const mimeType = matches[1];
    const dataBuffer = Buffer.from(matches[2], "base64");

    let folder = defaultSubfolder;
    let ext = ".jpg";

    if (mimeType.startsWith("image/")) {
        folder = "images";
        const subtype = mimeType.split("/")[1] || "jpeg";
        ext = subtype === "jpeg" ? ".jpg" : subtype === "svg+xml" ? ".svg" : `.${subtype}`;
    } else if (mimeType === "application/pdf") {
        folder = "pdfs";
        ext = ".pdf";
    } else if (mimeType.startsWith("text/")) {
        folder = "documents";
        ext = ".txt";
    }

    const folderPath = path.join(uploadFolder, folder);
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }

    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filePath = path.join(folderPath, filename);
    fs.writeFileSync(filePath, dataBuffer);

    return `http://localhost:3000/uploads/${folder}/${filename}`;
};

module.exports = {
    upload,
    uploadFolder,
    saveBase64File
};