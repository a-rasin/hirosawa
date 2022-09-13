import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import { PassportStatic } from 'passport';
import { Db } from 'mongodb';
import { body } from 'express-validator';
import { dataValidationErrorManagement } from './middleware';
import { isAuthenticated } from './middleware';

const router = express.Router();

export default (db: Db, passport: PassportStatic): Router => {
  // Sign up
  router.post(
    '/user',
    body('username').isLength({ min: 1 }),
    body('password').isLength({ min: 1 }),
    dataValidationErrorManagement,
    async (req, res) => {
      // Hash password
      const hash = await bcrypt.hash(req.body.password, 12);

      // Create new user
      const user = { username: req.body.username, hash };

      const registerUser = () => {
        db.collection('users')
          .insertOne(user, (err, result) => {
            if (err) {
              res.status(400).send(err);
            } else {
              req.login({
                id: result?.insertedId.toHexString() ?? '',
                ...user
              }, function(err: any) {
                if (err || !result) {
                  return res.status(500).send(err);
                }
                res.json({success: true, user: {id: result.insertedId, username: req.body.username}});
              });
            }
          });
      };

      db.collection('users')
        .findOne({username: user.username}, (err, record) => {
          if (err) {
            res.status(400).send(err);
          } else if (record) {
            res.status(500).json({error: "Username taken"});
          } else {
            registerUser();
          }
        });
    }
  )

  // Get current user
  router.get('/user', isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  router.post('/login', passport.authenticate('local'), (req, res) => {
    if (!req.user) {
      return res.status(401).json({ err: 'Not logged in' });
    }
    res.json({ success: true, user: {id: req.user.id, username: req.user.username} });
  });

  router.post('/logout', (req, res, next) => {
    req.logout((err) => {
      if (err) { return next(err); }
      res.json({success: true})
    });
  });

  return router;
}
