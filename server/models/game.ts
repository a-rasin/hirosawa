import mongoose, { Schema, model, Document } from 'mongoose';
import { User } from './user';

interface Move extends Document {
  x?: number;
  y?: number;
  stone?: number;
  reset?: boolean;
}

interface Game extends Document {
  user: User["_id"];
  date: Date;
  size: number;
  winner?: number | null;
  moves: [Move]
}

const requiredIfNoReset = function (this: Move): boolean {
  return !this.reset;
}

const requiredIfNoStone = function (this: Move): boolean {
  return !this.reset;
}

const moveSchema = new Schema<Move>({
  x: { type: Number, min: 0, required: requiredIfNoReset },
  y: { type: Number, min: 0, required: requiredIfNoReset },
  stone: { type: Number, min: 1, max: 2, required: requiredIfNoReset },
  reset: { type: Boolean, required: requiredIfNoStone }
});

const validateMove = function (this: Game, v: Move): boolean | undefined {
  if (v.x !== undefined && v.y !== undefined) {
    return v.x < this.size && v.y < this.size;
  }
}

const gameSchema = new Schema<Game>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  size: { type: Number, required: true, min: 5, max: 9 },
  winner: { type: Number, required: false },
  moves: [{ type: moveSchema, validate: validateMove }]
});

export default model<Game>('Game', gameSchema)
