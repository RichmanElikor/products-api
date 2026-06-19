import jwt from 'jsonwebtoken';


const verifyToken = (req, res, next) => {
  try {
    // save the req.headers.authorization value in a 
    const authHeader = req.headers.authorization;
    // check if the authHeader exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // extract the token from the authHeader  
    const token  = authHeader.split(' ')[1];
    // verify the token using jwt.verify() method and the secret key from environment variables
    // If the token is valid, the decoded payload will be returned and can be stored in a variable called decoded
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: 1, email: "rich@gmail.com", iat: ..., exp: ... }

    req.user = decoded; // this adds the decoded payload to the req object, allowing it to be accessed in subsequent middleware or route handlers
    next(); // this calls the next middleware function in the stack, allowing the request to proceed to the next step in the processing pipeline

  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

export default verifyToken; 