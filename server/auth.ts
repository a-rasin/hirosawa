import passport, { PassportStatic } from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { Db } from 'mongodb';

declare global {
  namespace Express {
    interface User {
      id: string,
      username: string,
    }
  }
}

export default (con: Db): PassportStatic => {
  passport.use(new Strategy((username: string, password: string, cb: any) => {
    // Get user by username from db
    con.collection('users')
      .findOne({username: username}, async (err, user) => {
        if (err) {
          return cb(err)
        } else if (!user) {
          return cb(null, false, {message: "No such user"});
        }

        try {
          const match = await bcrypt.compare(password, user.hash);
          if (!match) return cb(null, false, {message: "Wrong password"});

          return cb(null, { id: user._id, username: user.username });
        } catch (err) {
          return cb(err);
        }
      })
  }));

  passport.serializeUser((user: any, cb) => {
    process.nextTick(function() {
      cb(null, { id: user._id, username: user.username });
    });
  });

  passport.deserializeUser(function(user: Express.User, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });

  return passport;
}
