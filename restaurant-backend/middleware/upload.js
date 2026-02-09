const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Save to frontend public folder
        cb(null, path.join(__dirname, '../restaurant-frontend/public'));
    },
    filename: function (req, file, cb) {
        // Generate filename from item name (lowercase, no spaces) + extension
        const itemName = req.body.name || 'item';
        const cleanName = itemName.toLowerCase().replace(/\s+/g, '');
        const ext = path.extname(file.originalname);
        cb(null, cleanName + ext);
    }
});

// File filter - only accept images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'));
    }
};

// Create multer instance
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

module.exports = upload;
