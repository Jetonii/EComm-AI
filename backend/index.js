import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

// Import routes
import user from './routes/user.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

// Routes
app.use("/user", user);

// Start server
const server = app.listen(process.env.PORT, () => {
    console.log(`Server listening at port ${process.env.PORT}`);
});
