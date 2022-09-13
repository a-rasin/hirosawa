import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import { isAuthenticated } from './middleware';
import dotenv from 'dotenv';
import authHandler from './auth';
import gameHandler from './game';
import userHandler from './user';

dotenv.config();

const client = new MongoClient(process.env.DB ?? '', {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
});

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

const port = 5000;

client.connect((err, db) => {
  if (err || !db) {
    process.exit();
  }

  const con = db.db();

  const passport = authHandler(con);
  const gameRouter = gameHandler(con);
  const userRouter = userHandler(con, passport);

  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/', userRouter);
  app.use('/', isAuthenticated, gameRouter);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})
