// src/routes/aboutRoutes.js

import express from 'express';
import { homePage, getProducts, getProductById, addProduct, updateProduct, updateProductImage, deleteProduct } from '../controllers/productsControllers.js'
import verifyToken from '../middleware/verifyToken.js'; // Importing the verifyToken middleware to protect routes
import upload from '../middleware/uploadMiddleware.js'; // Importing the upload middleware to handle file uploads
import validate from '../middleware/validate.js'; // Importing the validate middleware to validate request body
import { addProductSchema, updateProductSchema  } from '../validator/productValidator.js'; // Importing the product schema for validation
const router = express.Router();

router.get("/", homePage);
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.post("/products", verifyToken, validate(addProductSchema), addProduct);
router.put('/products/:id', verifyToken, validate(updateProductSchema), updateProduct);
router.patch('/products/:id/image', verifyToken, upload.single('image'), updateProductImage);
router.delete("/products/:id", verifyToken, deleteProduct);
export default router; 