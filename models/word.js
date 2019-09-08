import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';

const USER_COLL = 'users';

export const DEFAULT_WORD_SCHEMA = {
  card: null,
  count: 0,
  dates: [],
  upcoming: false,  // States whether the word is in the user's 'upcoming' arr for words that will soon be added to deck
};

exports.addToUpcoming = (userId, newWords, newJlpt) => (
  new Promise((resolve, reject) => {
    const setWordsQuery = {};
    const schema = Object.assign({}, DEFAULT_WORD_SCHEMA);
    schema.upcoming = true;

    newWords.forEach(wordId => {
      setWordsQuery[`words.${wordId}`] = schema;
    });
    setWordsQuery.cardData.lastSession.date = new Date().getTime();

    if (newJlpt) {
      setWordsQuery.jlpt = newJlpt;
    }

    MongoClient.getDb().collection(USER_COLL).findOneAndUpdate({ _id: ObjectId(userId) }, {
      $push: { upcoming: { $each: newWords }},
      $set: { ...setWordsQuery, jlpt: newJlpt },
    }, {
      returnOriginal: false,
    }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  })
);
