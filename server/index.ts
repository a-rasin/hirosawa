import express from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import { isAuthenticated } from './middleware';
import dotenv from 'dotenv';
import passport from './auth';
import gameRouter from './game';
import userHandler from './user';

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(session({
  secret: 'foo',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DB }),
  cookie: {
    sameSite: "lax"
  }
}));

const port = process.env.PORT || 5000;

console.log("Try to connect to db")

const run = async () => {
  try {
    await mongoose.connect(process.env.DB || '');
  } catch (err) {
    console.log("Err:", err)
    process.exit();
  }

  const userRouter = userHandler(passport);

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/api', userRouter);
  app.use('/api', isAuthenticated, gameRouter);

  // Serve client files
  if(process.env.NODE_ENV === 'production') {
    app.use(express.static('../client/build'));

    app.get('*', (_, res) => {
      res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

run();
