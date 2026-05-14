import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import  connectDB from './config/db.js';
import  authRouter  from './routes/authRoute.js';
import userRouter from './routes/userRoute.js';
import cookieParser from "cookie-parser";
import reportRouter from './routes/reportRouter.js';
import sosRouter from './routes/sosRoute.js';

dotenv.config();

const PORT = parseInt(process.env.PORT) ;
const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/report", reportRouter);
app.use("/sos", sosRouter);

// Start server and connect to DB
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
await connectDB();
