const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

module.exports = (con) => {
  passport.use(new LocalStrategy((username, password, cb) => {
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

          return cb(null, user);
        } catch (err) {
          return cb(err);
        }
      })
  }));

  passport.serializeUser((user, cb) => {
    process.nextTick(function() {
      cb(null, { id: user._id, username: user.username });
    });
  });

  passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
      return cb(null, user);
    });
  });


  return passport;
}
