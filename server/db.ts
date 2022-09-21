import { ObjectId } from 'mongodb';
import GameModel from './models/game';

export default {
  getSingleGame: async (userId: string, gameId: string) => {
    return await GameModel.findOne({ _id: new ObjectId(gameId), user: new ObjectId(userId) });
  }
}
