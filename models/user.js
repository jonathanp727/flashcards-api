import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';
import { isSameDay } from '../lib/dateLogic';
import WordModel from './word';
import DictModel from './dict';

const USER_COLL = 'users';

exports.all = () => (
  new Promise((resolve, reject) => {
    MongoClient.getDb().collection(USER_COLL).find().toArray((err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  })
);

exports.get = (id) => (
  new Promise((resolve, reject) => {
    MongoClient.getDb().collection(USER_COLL).findOne({ _id: ObjectId(id) }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  })
);

exports.new = (data) => (
  new Promise((resolve, reject) => {
    MongoClient.getDb().collection(USER_COLL).insertOne({
      general: {
        username: data.username,
        password: data.password,
        isAdmin: false,
      },
      settings: {
        dailyNewCardLimit: 5,
      },
      cardData: {
        lastSession: {
          date: null,
          upcomingCardsDone: 0,
        },
        jlpt: {
          level: data.level,
          index: 0,
        },
      },
      words: {},
      cards: [],
      upcoming: [],
      calendar: [
      ],
    }, (err, result) => {
      if (err) reject(err);
      else resolve(result.insertedId);
    });
  })
);

exports.update = (id, data) => (
  new Promise((resolve, reject) => {
    MongoClient.getDb().collection(USER_COLL).updateOne({ _id: ObjectId(id) }, {
      'general.username': data.username,
      'general.password': data.password,
    }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  })
);

exports.delete = (id) => (
  new Promise((resolve, reject) => {
    MongoClient.getDb().collection(USER_COLL).deleteOne({ _id: ObjectId(id) }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  })
);

/**
 * Checks if user has space in their upcoming for automatic JLPT based new flashcards.  If the
 * check has not been performed today and there is space, adds new cards to upcoming and returns
 * updated user.
 *
 * @param id Mongo UserId
 * @return         Updated user object
 */
exports.getWithUpcoming = (id) => (
  new Promise(async (resolve, reject) => {
    try {
      var user = await exports.get(id);

      const numCardsToAdd = user.settings.dailyNewCardLimit - user.upcoming.length;
      const isAlreadyDoneToday = isSameDay(new Date(user.cardData.lastSession.date), new Date());

      if (!isAlreadyDoneToday && numCardsToAdd > 0) {
        const cursor = await DictModel.getNextWordsByJlpt(user.cardData.jlpt);
        const newWords = [];
        let newJlpt = {};
        while (newWords.length < numCardsToAdd) {
          const word = await cursor.next();

          // If there is no existing card for word, push
          if (!(word._id in user.words) || !user.words[word._id].card) {
            newWords.push(word._id);

            // If this is the last word to be added, record jlpt stats for updating user's level
            if(newWords.length === numCardsToAdd) {
              newJlpt = { level: word.jlpt.level, index: word.jlpt.index + 1 }
            }
          }
        }
        user = await WordModel.addToUpcoming(id, newWords, newJlpt);
      }

      resolve(user);
    } catch (getUserErr) {
      reject(getUserErr);
    }
  })
);
