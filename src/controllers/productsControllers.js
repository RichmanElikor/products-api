import productService from "../services/productService.js"


// Home
const homePage = (req, res, next) => {
  try {
    res.send("Welcome to the homepage!");
  } catch (error) {
    next(error);
  }
};

// Get all products
const getProducts = async (req, res, next) => {
   try {
    // Integrating Pagination and limit. 
    // extracting req.query.page, req.query.limit and req.query.search
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const search = req.query.search || '';

    // calculating the skip value based on the page and limit
    const skip = (page - 1) * limit;

    // using prisma to find the total count of products that match the search query
    const total = await productService.total({ search });
    
    // using prisma to find the products that match the search query, applying pagination with skip and limit
    const products = await productService.getProduct({ skip, limit, search });

    // returning the products along with pagination metadata
    res.status(200).json({
      data: products, 
      pagination: {
        total, 
        page, 
        limit, 
        totalPages: Math.ceil(total / limit), // This calculates the total number of pages based on the total count of products and the limit per page, allowing clients to understand how many pages of results are available.
        hasNextPage: page < Math.ceil(total / limit), // This indicates whether there is a next page of results available, which can be useful for clients to determine if they should request the next page.
        hasPrevPage: page > 1, // This indicates whether there is a previous page of results available, which can be useful for clients to determine if they should request the previous page.
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get product by ID
const getProductById = async (req, res, next) => {
 // get the id from the req.params object and convert it to an integer using parseInt() method
  try {
    const id = parseInt(req.params.id);
    const product = await productService.getProductById({ id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Add product
const addProduct = async (req, res, next) => {
  try {
    const { name, price } = req.body;

    const newProduct = await productService.createProduct({ name, price });

    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

// Update product
const updateProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price } = req.body;

    const product = await productService.getProductById({ id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await productService.updateProduct({ id, name, price });

    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// Update Product image 
const updateProductImage = async (req, res, next) => {
  try {
    // save product id 
    const id = parseInt(req.params.id);
    // check if product is available or not
    const product = await productService.getProductById({ id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // check if image file is uploaded or not
    if (!req.file) {
      return res.status(400).json({ message: "Image file not uploaded" });
    }
    // save request image file 
    const image = req.file.filename;
    // update the product image url in the database 
    const update = await productService.updateProductImage({ id, image });
    res.status(200).json({
      message: "Product image updated successfully",
      data: update,
    });
  } catch (error) {
    next(error);
  }
};

// Delete product
const deleteProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const product = await productService.getProductById({ id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await productService.deleteProduct({ id });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export {
  homePage,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  updateProductImage,
  deleteProduct,
}