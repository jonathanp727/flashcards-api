import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';

/**
 * Returns an array (of word IDs) of the `numCardToAdd` number of cards that 
 * are next based on the users JLPT rank.
 *
 * @param user [Object]
 *   words: Object with wordIds as keys
 *   jlpt: { level: Number, index: Number }
 * @return [
 *    Array of new words, 
 *    new jlpt position if array isn't empty ({ level: Number, index: Number })
 * ]
 */
exports.getNextWords = async (user, numCardsToAdd) => (
  new Promise(async (resolve, reject) => {
    const cursor = MongoClient.getDb().collection('dictionary').find({
      $or: [
        { 'jlpt.level': { $lt: user.cardData.jlpt.level } },
        { 'jlpt.level': { $eq: user.cardData.jlpt.level }, 'jlpt.index': { $gte: user.cardData.jlpt.index } },
      ],
    }).sort(
      { 'jlpt.level': -1, 'jlpt.index': 1 }
    ).hint(
      { 'jlpt.level': -1, 'jlpt.index': 1 }
    ).project({ _id: 1, jlpt: 1 });

    const newWords = [];

    let jlpt = {};
    while (newWords.length < numCardsToAdd) {
      const word = await cursor.next();
      // If there is no existing card for word, push
      if (!(word._id in user.words) || !user.words[word._id].card) {
        newWords.push(word._id);

        // If this is the last word to be added, record jlpt stats for updating user's level
        if(newWords.length === numCardsToAdd) {
          jlpt = { level: word.jlpt.level, index: word.jlpt.index + 1 }
        }
      }
    }
    resolve([newWords, jlpt]);
  })
);
