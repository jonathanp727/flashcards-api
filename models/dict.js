import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';

/**
 * Returns a promise that resolves into mongoDB cursor of the words following the given JLPT index
 *
 * @param   jlpt       { level: Number, index: Number }
 * @return             Promise(mongoDB cursor)
 */
exports.getNextWordsByJlpt = async (jlpt, numCardsToAdd) => (
  MongoClient.getDb().collection('dictionary').find({
    $or: [
      { 'jlpt.level': { $lt: jlpt.level } },
      { 'jlpt.level': { $eq: jlpt.level }, 'jlpt.index': { $gte: jlpt.index } },
    ],
  }).sort(
    { 'jlpt.level': -1, 'jlpt.index': 1 }
  ).hint(
    { 'jlpt.level': -1, 'jlpt.index': 1 }
  ).project({ _id: 1, jlpt: 1 })
);

exports.lookup = (query) => {
  if (query.charCodeAt(0) > 255) {
    // word is japanese
    return MongoClient.getDb().collection('dictionary').find({
      $or: [
        { 'r_ele.reb': query },
        { 'k_ele.keb': query },
      ],
    }).project({ sentences: 0 }).toArray();
    
  } else {
    // // word is english
    // MongoClient.getDb().collection('dictionary').find({
    //   $text: { $search: `\"${query}\"` },
    // }, {
    //   score: { $meta: "textScore" },
    // }).project({ sentences: 0 }).toArray((err, res) => {
    //   callback(err, res);
    // });
  }
}
