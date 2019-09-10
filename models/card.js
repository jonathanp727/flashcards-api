import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';
import Card from '../lib/cardLogic';

const USER_COLL = 'users';

/**
 * Create and return standard word object.  
 *
 * @param createWithCard bool    True if card data should also be constructed, otherwise left null
 * @return                       Word object
 */
const createWord = (createWithCard = false) => ({
  dict: {
    count: 0,
    dates: [],
    sentences: [],
  },
  card: createWithCard ? new Card() : null,
});

/**
 * Adds an array of words to upcoming, updating the user's JLPT and their date of last session.
 * This function is to be used for automatic new words based on JLPT rank only, as it modifies
 * the JLPT and changes the date which is used to track whether cards should be automatically
 * updated or not.
 *
 * @param userId    Mongo ObjectId
 * @param newWords  Array of mongoObjectIds,
 * @param newJlpt   { level: Number, index: Number }
 * @return          Updated user object
 */
exports.addToUpcoming = (userId, newWords, newJlpt) => (
  new Promise((resolve, reject) => {
    const setWordsQuery = {};
    const schema = createWord(true);

    newWords.forEach(wordId => {
      setWordsQuery[`words.${wordId}`] = schema;
    });
    setWordsQuery['cardData.lastSession.date'] = new Date().getTime();

    MongoClient.getDb().collection(USER_COLL).findOneAndUpdate({ _id: ObjectId(userId) }, {
      $push: { upcoming: { $each: newWords }},
      $set: { ...setWordsQuery, 'cardData.jlpt': newJlpt },
    }, {
      returnOriginal: false,
    }, (err, result) => {
      if (err) reject(err);
      else resolve(result.value);
    });
  })
);
