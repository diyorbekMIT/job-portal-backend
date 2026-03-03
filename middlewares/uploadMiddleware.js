const path = require('path');
const multer = require('multer');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save files to ./uploads/
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Example: 1709456123456-avatar.jpg
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);           // Accept file
  } else {
    cb(new Error('Only .jpeg, .jpg, .png, and .pdf formats are allowed'), false);
  }
};

// Multer instance
const upload = multer({ storage, fileFilter });

module.exports = upload;
