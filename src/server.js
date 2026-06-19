// src/server.js
import path from 'path';
import express from 'express';
import helmet from 'helmet'; 
import router from './routes/aboutRoutes.js';
import authRouter from './routes/authRoutes.js';
import requestLogger from './middleware/routeloggersMiddleware.js';
import errHandler from './middleware/errorMiddleware.js';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

// Set security-related HTTP headers using Helmet
//helmet() helps to secure the Express app by setting various HTTP headers that can protect against common web vulnerabilities.
app.use(helmet());
// Apply rate limiting to all requests 
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for auth routes
  message: "Too many login attempts from this IP, please try again after 15 minutes"
})

app.use(limiter);
app.use(requestLogger);
app.use("/api/auth", authLimiter, authRouter)
app.use("/api", router);
app.use(errHandler);
app.listen(3000, "0.0.0.0", () => {
  console.log('Server running on port 3000');
  console.log('Access the server at http://localhost:3000');
});