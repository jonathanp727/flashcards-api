import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';

/**
 * Returns a mongoDB cursor of the words following the given JLPT index
 *
 * @param   jlpt       { level: Number, index: Number }
 * @return             mongoDB cursor
 */
exports.getNextWordsByJlpt = async (jlpt, numCardsToAdd) => (
  new Promise(async (resolve, reject) => {
    const cursor = MongoClient.getDb().collection('dictionary').find({
      $or: [
        { 'jlpt.level': { $lt: jlpt.level } },
        { 'jlpt.level': { $eq: jlpt.level }, 'jlpt.index': { $gte: jlpt.index } },
      ],
    }).sort(
      { 'jlpt.level': -1, 'jlpt.index': 1 }
    ).hint(
      { 'jlpt.level': -1, 'jlpt.index': 1 }
    ).project({ _id: 1, jlpt: 1 });

    resolve(cursor);
  })
);
