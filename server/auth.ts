import passport from 'passport';
import { Strategy } from 'passport-local';
import bcrypt from 'bcrypt';
import UserModel from './models/user';

declare global {
  namespace Express {
    interface User {
      id: string,
      username: string,
      rawId: string,
      publicKey: string
    }
  }
}

passport.use(new Strategy(async (username: string, password: string, cb: any) => {
  try {
    // Get user by username from db
    const user = await UserModel.findOne({username: username});

    if (!user) {
      return cb(null, false, {message: "No such user"});
    }

    const match = await bcrypt.compare(password, user.hash);
    if (!match) return cb(null, false, {message: "Wrong password"});

    return cb(null, { id: user._id, username: user.username, publicKey: user.publicKey, rawId: user.rawId });
  } catch (err) {
    return cb(err)
  }
}));

passport.serializeUser((user: any, cb) => {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, publicKey: user.publicKey, rawId: user.rawId });
  });
});

passport.deserializeUser(function(user: Express.User, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

export default passport;
