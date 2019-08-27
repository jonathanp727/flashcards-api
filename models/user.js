import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';

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

exports.update = (id, data, callback) => (
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

exports.delete = (id, callback) => (
  new Promise((resolve, reject) => {
    MongoClient.getDb().collection(USER_COLL).deleteOne({ _id: ObjectId(id) }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  })
);
