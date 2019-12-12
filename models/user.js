import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';
import { isSameDay } from '../lib/dateLogic';
import stats from '../lib/statsHandler'; 
import WordModel from './word';
import DictModel from './dict';
import { saltHashPassword } from '../lib/cryptoUtil';

const USER_COLL = 'users';

exports.all = () => (
  MongoClient.getDb().collection(USER_COLL).find().toArray()
);

exports.get = (id) => (
  MongoClient.getDb().collection(USER_COLL).findOne({ _id: ObjectId(id) })
);

exports.new = (data) => {
  const hashResult = saltHashPassword(data.password);

  return MongoClient.getDb().collection(USER_COLL).insertOne({
    general: {
      username: data.username,
      password: hashResult.passwordHash,
      salt: hashResult.salt,
      isAdmin: false,
    },
    settings: {
      dailyNewCardLimit: 5,
    },
    cardData: {
      lastSession: {
        date: null,
        upcomingCardsDone: 0, // Limit the amount of new cards a user can see in a day
      },
      jlpt: {
        level: data.level,
        index: 0,
      },
    },
    words: {},
    cards: {
      inProg: [],
      upcoming: [],
    },
    calendar: [
    ],
    stats: new stats.User(),
  }).then(res => res.ops[0]);
};

exports.update = (id, data) => (
  MongoClient.getDb().collection(USER_COLL).updateOne({ _id: ObjectId(id) }, {
    'general.username': data.username,
    'general.password': data.password,
  })
);

exports.delete = (id) => (
  MongoClient.getDb().collection(USER_COLL).deleteOne({ _id: ObjectId(id) })
);

/**
 * Checks if user has space in their upcoming for automatic JLPT based new flashcards.  If the
 * check has not been performed today and there is space, adds new cards to upcoming and returns
 * updated user.
 *
 * @param id Mongo UserId
 * @return         Updated user object
 */
exports.getWithUpcoming = async (id) => {
  let user = await exports.get(id);
  const numCardsToAdd = user.settings.dailyNewCardLimit - user.cards.upcoming.length;
  const isAlreadyDoneToday = isSameDay(new Date(user.cardData.lastSession.date), new Date());
  if (!isAlreadyDoneToday && numCardsToAdd > 0) user = await getNewCards(user, numCardsToAdd);
  return user;
};

const getNewCards = async (user, numCardsToAdd) => {
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
  return await WordModel.addToUpcoming(user._id, newWords, newJlpt);
}
