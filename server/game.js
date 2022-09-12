const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { dataValidationErrorManagement } = require('./middleware');
const { body } = require('express-validator');

const getWinnerObject = (winner) => ({
  isGameFinished: winner !== 0,
  winner: ["None", "White", "Black", "Draw"][winner]
});

const checkForWinner = (board) => {
  let available = 0;

  for (let i = 0; i < board.length; i++) {
    let x = 1,
      y = 1;
    for (let j = 0; j < board.length; j++) {
      if (board[i][j] === 0) {
        available++;
      }

      // Skip first item
      if (j === 0) {
        continue;
      }

      // If previous stone is different to current one reset counter
      if (board[i][j] !== board[i][j - 1]) {
        x = 1;
      } else {
        x++;
      }

      // If previous stone is different to current one reset counter
      if (board[j][i] !== board[j - 1][i]) {
        y = 1;
      } else {
        y++;
      }

      if (x === 5 && board[i][j] !== 0) {
        return board[i][j];
      }

      if (y === 5 && board[j][i] !== 0) {
        return board[j][i];
      }
    }
  }

  if (available === 0) {
    return 3;
  }
  return 0;
}

module.exports = (db) => {
  const dbFuncs = require('./db.js')(db);

  // Games
  router.get('/games', (req, res) => {
    db.collection('games')
      .find({ user: ObjectId(req.user.id), winner: { $ne: null } })
      .toArray((err, result) => {
        if (err) {
          res.status(500).json(err);
        } else {
          res.json({data: result});
        }
      })
  })

  // Get single game
  router.get('/game/:id',
    (req, res) => {
    dbFuncs.getSingleGame(req.user.id, req.params.id, (err, result) => {
        if (err) {
          res.status(500).json(err);
        } else {
          res.json({data: result});
        }
      });
  })

  // Create game
  router.post(
    '/game',
    body('size').isInt({ min: 5, max: 9 }),
    dataValidationErrorManagement,
    (req, res) => {
      db.collection('games')
        .insertOne({
          user: ObjectId(req.user.id),
          date: new Date(),
          size: req.body.size,
          moves: [],
          winner: null
        }, (err, result) => {
          if (err) {
            res.status(500).json(err);
          } else {
            res.json({data: result});
          }
        })
    }
  )

  // Update game
  router.put(
    '/game',
    body('game').isMongoId(),
    body('move').custom((value, { req }) => {
      if (!value.reset) {
        body('move.x')
          .isInt({ min: 0 })
          .run(req);
        body('move.y')
          .isInt({ min: 0 })
          .run(req);
        body('move.stone')
          .isInt({ min: 1, max: 2 })
          .run(req);
      }

      return true;
    }),
    dataValidationErrorManagement,
    (req, res) => {
      // Get game
      dbFuncs.getSingleGame(req.user.id, req.body.game, (err, result) => {
        if (err || !result) {
          return res.status(500).json(err || {err: "No such game"});
        }

        // If already finished return the winner
        if (result.winner) {
          return res.json(getWinnerObject(result.winner));
        }

        // Reset board
        if (req.body.move.reset) {
          db.collection('games')
            .updateOne({
              user: ObjectId(req.user.id),
              _id: ObjectId(req.body.game),
              winner: null
            }, {
              $set: { moves: [] },
            }, (err, _) => {
              if (err) {
                return res.status(500).json(err);
              }

              res.json(getWinnerObject(0));
            });

          return;
        }

        // Else calculate winner
        let board = new Array(result.size).fill([]);

        board = board.map(() =>
          new Array(result.size).fill(0).map(() => 0)
        );

        result.moves.forEach(a => {
          board[a.x][a.y] = a.stone;
        });

        const {x, y, stone} = req.body.move;

        if (x > board.length || x < 0 || y < 0 || y > board.length) {
          return res.status(500).json({err: "Move should have x and y that are inside the board's bounds."});
        }

        board[x][y] = stone;

        const winner = checkForWinner(board);

        // Update game
        db.collection('games')
          .updateOne({
            user: ObjectId(req.user.id),
            _id: ObjectId(req.body.game),
            winner: null
          }, {
            $push: { moves: req.body.move },
            $set: { winner: winner > 0 ? winner : null }
          }, (err, _) => {
            if (err) {
              return res.status(500).json(err);
            }

            res.json(getWinnerObject(winner));
          });
      })
    }
  )

  router.delete('/game/:id', (req, res) => {
    db.collection('games')
      .deleteOne({
        user: ObjectId(req.user.id),
        _id: ObjectId(req.params.id),
        winner: null
      }, (err, doc) => {
        if (err) {
          return res.status(500).json(err);
        }
        return res.json(doc);
      });
  })

  return router;
}
