const express = require('express');
const router = express.Router();
const { upload } = require('../../middleware/multer');

// Single file upload endpoint (field: 'file')
router.post('/single', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const relativePath = `/uploads/${pathRelative(req.file.destination)}/${req.file.filename}`;
        const fileUrl = `http://localhost:3000${relativePath}`;

        return res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl,
            url: fileUrl,
            relativePath,
            file: req.file
        });
    } catch (err) {
        return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

// Alias for root POST /api/upload (for backwards-compatibility)
router.post('/', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const relativePath = `/uploads/${pathRelative(req.file.destination)}/${req.file.filename}`;
        const fileUrl = `http://localhost:3000${relativePath}`;

        return res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl,
            url: fileUrl,
            relativePath,
            file: req.file
        });
    } catch (err) {
        return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

// Multiple files upload endpoint (field: 'files' or 'posters')
router.post('/multiple', upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedFiles = req.files.map((file) => {
            const relativePath = `/uploads/${pathRelative(file.destination)}/${file.filename}`;
            const fileUrl = `http://localhost:3000${relativePath}`;
            return {
                url: fileUrl,
                relativePath,
                file
            };
        });

        return res.status(200).json({
            message: 'Files uploaded successfully',
            urls: uploadedFiles.map((f) => f.url),
            files: uploadedFiles
        });
    } catch (err) {
        return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

// Helper function to extract subfolder (e.g. images, pdfs, etc.)
function pathRelative(dest) {
    const parts = dest.split(/[\/\\]/);
    return parts[parts.length - 1];
}

module.exports = router;
