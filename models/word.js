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
      $push: { 'cards.upcoming': { $each: newWords }},
      $set: { ...setWordsQuery, 'cardData.jlpt': newJlpt },
    }, {
      returnOriginal: false,
    }, (err, result) => {
      if (err) reject(err);
      else resolve(result.value);
    });
  })
);

/**
 * Determines new interval for flashcard based on responseQuality (1-5).  Then updates the words
 * 'card' field in the db and places the card in it's new position in the cards array, which is sorted
 * by increasing interval length.
 *
 * @param userId          ObjectId
 * @param wordId          ObjectId
 * @param upcoming        Boolean  True if card is in upcoming arr and not in cards arr
 * @param responseQuality Number (from 1 to 5)
 */
exports.doCard = (userId, wordId, upcoming, responseQuality) => (
  new Promise(async (resolve, reject) => {
    let query = {};
    
    // Set pull query depending on which array the card previously belonged to
    if (upcoming) {
      query.$pull = { 'cards.upcoming': ObjectId(wordId) };
    } else {
      query.$pull = { 'cards.inProg': ObjectId(wordId) };
    };

    // Pull card before getting user to make sure we have updated version of cards arr and query
    // for user in order to find new position of card in array
    MongoClient.getDb().collection(USER_COLL).findOneAndUpdate({
      _id: ObjectId(userId)
    }, query, {
      returnOriginal: false,
    }, (err, user) => {
      if (err) reject(err);

      const card = new Card(user.words[wordId].card).processInterval(responseQuality)

      // Find new position of card
      const pos = getNewCardPos(user, card);

      MongoClient.getDb().collection('users').updateOne({ _id: ObjectId(userId) }, {
        $set: {
          [`words.${wordId}.card`]: card,
        },
        $push: {
          'cards.inProg': {
            '$each': [ ObjectId(wordId) ],
            '$position': pos,
          },
        },
      }, err => {
        if (err) reject(err);
        else resolve();
      });
    });
  })
);

/**
 * Finds the new position in the user inProg cards array for `card` to be placed at.  Make sure to pull
 * the card from user before calling this function.
 *
 * @param user     Object
 * @param card     Object
 * @return Number (new position)
 */
exports.getNewCardPos = (user, card) => {
  const { inProg } = user.cards;
  let pos = 0;
  
  while (pos < inProg.length && card.date > new Date(user.words[inProg[pos]].card.date)) {
    pos += 1;
  }

  return pos;
}
