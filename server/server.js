import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middlewares/index.js';
import routes from './routes/index.js';

const requiredEnv = ['MONGO_URI', 'CLIENT_ORIGIN'];
const missing = requiredEnv.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error('Missing required env:', missing.join(', '));
  process.exit(1);
}

const origins = process.env.CLIENT_ORIGIN.split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);
if (!origins.length) {
  console.error('CLIENT_ORIGIN must contain at least one origin.');
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

await connectDB();

app.get('/', (req, res) => res.send('server is running'));
app.use('/api', routes);

// 404 for undefined routes (must be after all route definitions)
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

//to start our application
//app.listen(PORT, () => console.log(`server is running on port ${PORT}`))
export default app;