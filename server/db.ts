import { ObjectId, Db, Callback } from 'mongodb';

export default (db: Db) => ({
  getSingleGame: (userId: string, gameId: string, func: Callback) => {
    db.collection('games')
      .findOne({ _id: new ObjectId(gameId), user: new ObjectId(userId) }, func)
  }
})
