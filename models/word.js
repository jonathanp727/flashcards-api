import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';

const USER_COLL = 'users';

exports.DEFAULT_WORD_SCHEMA = {
  card: null,
  count: 0,
  dates: [],
  upcoming: false,  // States whether the word is in the user's 'upcoming' arr for words that will soon be added to deck
};

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
    const schema = Object.assign({}, exports.DEFAULT_WORD_SCHEMA);
    schema.upcoming = true;

    newWords.forEach(wordId => {
      setWordsQuery[`words.${wordId}`] = schema;
    });
    setWordsQuery['cardData.lastSession.date'] = new Date().getTime();
    setWordsQuery.jlpt = newJlpt;

    MongoClient.getDb().collection(USER_COLL).findOneAndUpdate({ _id: ObjectId(userId) }, {
      $push: { upcoming: { $each: newWords }},
      $set: { ...setWordsQuery, jlpt: newJlpt },
    }, {
      returnOriginal: false,
    }, (err, result) => {
      if (err) reject(err);
      else resolve(result.value);
    });
  })
);
