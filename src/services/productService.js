import prisma from '../config/prisma.js'

// Service for the products 
const productService = {
  // add product - name and price ;
  createProduct: async ({ name, price }) => {
    return await prisma.product.create({ data: { name, price }});
  },

  // get products ;
  getProduct: async ({ skip, limit, search }) => {
    return await prisma.product.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      }, 
      skip, 
      take: limit, 
      orderBy: {
        createdAt: 'desc'
      }
    })
  }, 

  // get product by id 
  getProductById: async ({ id }) => {
    return await prisma.product.findUnique({
      where: { id }
    })
  }, 

  // Update a product 
  updateProduct: async ({ id, name, price }) => {
    return await prisma.product.update({
      where: { id }, 
      data: { name, price }
    })
  },

  // updateProductImage 
  updateProductImage: async ({ id, image }) => {
    return await prisma.product.update({
      where: { id }, 
      data: { image }
    })
  },

  // delete product 
  deleteProduct: async ({ id }) => {
    return await prisma.product.delete({
      where: { id }
    })
  },

  // total count 
  total: async ({ search }) => {
    return await prisma.product.count({
      where: {
        name: {
          contains: search, 
          mode: 'insensitive'
        }
      }
    })
  }

}


export default productService;
