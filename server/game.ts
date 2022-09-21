import express from 'express';
import { ObjectId } from 'mongodb';
import { dataValidationErrorManagement } from './middleware';
import { body } from 'express-validator';
import dbFuncs from './db';
import GameModel from './models/game';

const router = express.Router();

const getWinnerObject = (winner: number) => ({
  isGameFinished: winner !== 0,
  winner: ["None", "White", "Black", "Draw"][winner]
});

const checkForWinner = (board: number[][]) => {
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

// Games
router.get('/games', async (req, res) => {
  try {
    const result = await GameModel.find({ user: new ObjectId(req.user!.id), winner: { $ne: null } })
    res.json({data: result});
  } catch (err) {
    res.status(500).json(err);
  }
})

// Get single game
router.get('/game/:id', async (req, res) => {
  try {
    const result = await dbFuncs.getSingleGame(req.user!.id, req.params.id);
    res.json({data: result});
  } catch (err) {
      res.status(500).json(err);
  }
});

// Create game
router.post(
  '/game',
  body('size').isInt({ min: 5, max: 9 }),
  dataValidationErrorManagement,
  async (req, res) => {
    try {
      const result = new GameModel({
        user: new ObjectId(req.user!.id),
        date: new Date(),
        size: req.body.size,
        moves: [],
        winner: null
      });
      await result.save();

      res.json({data: result});
    } catch (err) {
      res.status(500).json(err);
    }
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
  async (req, res) => {
    try {
      // Get game
      const result = await dbFuncs.getSingleGame(req.user!.id, req.body.game);

      if (!result) {
        throw new Error("No such game");
      }

      // If already finished return the winner
      if (result.winner) {
        return res.json(getWinnerObject(result.winner));
      }

      // Reset board
      if (req.body.move.reset) {
        await GameModel.updateOne({
          user: new ObjectId(req.user!.id),
          _id: new ObjectId(req.body.game),
          winner: null
        }, {
          $set: { moves: [] },
        });

        res.json(getWinnerObject(0));
        return;
      }

      // Else calculate winner
      let board = new Array(result.size).fill([]);

      board = board.map(() =>
        new Array(result.size).fill(0).map(() => 0)
      );

      result.moves.forEach(a => {
        if (a.x !== undefined && a.y !== undefined) {
          board[a.x][a.y] = a.stone;
        }
      });

      const {x, y, stone} = req.body.move;

      if (x > board.length || x < 0 || y < 0 || y > board.length) {
        return res.status(500).json({err: "Move should have x and y that are inside the board's bounds."});
      }

      board[x][y] = stone;

      const winner = checkForWinner(board);

      // Update game
      await GameModel.updateOne({
        user: new ObjectId(req.user!.id),
        _id: new ObjectId(req.body.game),
        winner: null
      }, {
        $push: { moves: req.body.move },
        $set: { winner: winner > 0 ? winner : null }
      });

      res.json(getWinnerObject(winner));
    } catch (err) {
      return res.status(500).json(err || {err: "No such game"});
    }
  }
);

router.delete('/game/:id', async (req, res) => {
  try {
    const result = await GameModel.deleteOne({
      user: new ObjectId(req.user!.id),
      _id: new ObjectId(req.params.id),
      winner: null
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
})

export default router;
