import { z } from 'zod';

// Define the schema for product validation 
// Add product schema
const addProductSchema = z.object({
  // name is required and must be a string 
  // with a mininum and maximum length of 3 and 50 characters respectively
  name: z.string().min(3).max(50),
  // price is required and must be a positive number 
  price: z.number().positive(),
})

// Update product schema 
const updateProductSchema = z.object({
// name is optional and must be a string
  name: z.string().min(3).max(50).optional(),
  // price is optional and must be a positive number
  price: z.number().positive().optional(),
})

export { addProductSchema, updateProductSchema };