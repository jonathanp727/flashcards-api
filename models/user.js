import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';
import { isSameDay } from '../lib/dateLogic';
import { getNextWords } from './card';
import { DEFAULT_WORD_SCHEMA } from './word';

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

// Gets user and also checks if new cards should be added, doing so if necessary
exports.addToUpcoming = (id) => (
  new Promise(async (resolve, reject) => {
    try {
      var user = await exports.get(id);

      const numCardsToAdd = user.settings.dailyNewCardLimit - upcoming.length;
      const isAlreadyDoneToday = isSameDay(new Date(user.cardData.lastSession.date), new Date());

      if (!isAlreadyDoneToday && numCardsToAdd > 0) {
        const [newWords, newJlpt] = await getNextWords(user, numCardsToAdd);
        const schema = Object.assign({}, DEFAULT_WORD_SCHEMA);
        schema.upcoming = true;
        const setWordsQuery = {};
        newWords.forEach(wordId => {
          setWordsQuery[`words.${wordId}`] = schema;
          setWordsQuery.cardData.lastSession.date = new Date().getTime();
          user.upcoming.push(wordId);
          user.words[wordId] = Object.assign({}, schema);
        });

        MongoClient.getDb().collection(USER_COLL).updateOne({ _id: ObjectId(id) }, {
          $push: { upcoming: { $each: newWords }},
          $set: { ...setWordsQuery, jlpt: newJlpt },
        }, (err) => {
          if (err) reject(err);
          else resolve(user);
        });
      } else {
        resolve(user);
      }
    } catch (getUserErr) {
      reject(getUserErr);
    }
  })
);
