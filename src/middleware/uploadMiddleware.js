import multer from 'multer';
import path from 'path';

// Set up storage engine fo multer 
const storage = multer.diskStorage({
  // Destination to store image - directory
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  // file name to save
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

//file filter to allow only image files 
const fileFilter = (req, file, cb) => {
  // allowed file types
  const allowedTypes = [ 'image/jpeg', 'image/png', 'image/jpg' ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and JPG are allowed.'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {fileSize: 5 * 1024 * 1024}, // limit file size to 5MB
});

export default upload;