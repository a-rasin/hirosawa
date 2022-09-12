const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./middleware');

require('dotenv').config();
const client = new MongoClient(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
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

  const passport = require('./auth.js')(con);
  const gameRouter = require('./game.js')(con);
  const userRouter = require('./user.js')(con, passport);
  app.use(passport.initialize());
  app.use(passport.session());

  app.use('/', userRouter);
  app.use('/', isAuthenticated, gameRouter);

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})

