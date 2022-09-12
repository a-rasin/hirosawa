const { ObjectId } = require('mongodb');

module.exports = (db) => ({
  getSingleGame: (userId, gameId, func) => {
    db.collection('games')
      .findOne({ _id: ObjectId(gameId), user: ObjectId(userId) }, func)
  }
})
