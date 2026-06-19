// Middleware to validate request body using the schema from validator folder
const validate = (schema) => (req, res, next) => {
  // Validate the request body against the provided schema
  const result = schema.safeParse(req.body);

  // If validation fails, return error 
  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed", 
      errors: result.error.flatten().fieldErrors
    })
}
  // if validation is successful, proceed 
  req.body = result.data;
  next();
}

export default validate;