import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';
import Card from '../lib/cardLogic';
import { shouldCreateCard } from '../lib/cardLogic';
import stats from '../lib/statsHandler';

const USER_COLL = 'users';

/**
 * Create and return standard word object.  
 *
 * @param createWithCard bool    True if card data should also be constructed, otherwise left null
 * @return                       Word object
 */
const createWord = (createWithCard = false) => ({
  aux: {
    sentences: [],
    notes: "",
  },
  card: createWithCard ? new Card() : null,
  stats: new stats.Word(),
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
exports.addToUpcoming = (userId, newWords, newJlpt) => {
  const setWordsQuery = {};
  const schema = createWord(true);

  newWords.forEach(wordId => {
    setWordsQuery[`words.${wordId}`] = schema;
  });
  setWordsQuery['cardData.lastSession.date'] = new Date().getTime();

  return MongoClient.getDb().collection(USER_COLL).findOneAndUpdate({ _id: ObjectId(userId) }, {
    $push: { 'cards.upcoming': { $each: newWords }},
    $set: { ...setWordsQuery, 'cardData.jlpt': newJlpt },
  }, {
    returnOriginal: false,
  });
}

/**
 * Determines new interval for flashcard based on responseQuality (1-5).  Then updates the words
 * 'card' field in the db and places the card in it's new position in the cards array, which is sorted
 * by increasing interval length.
 *
 * @param userId          ObjectId
 * @param wordId          ObjectId
 * @param upcoming        Boolean  True if card is in upcoming arr and not in cards arr
 * @param responseQuality Number (from 1 to 5)
 * @return    { user, redo (boolean that states whether card needs to be redone)}
 */
exports.doCard = async (userId, data) => {
  const { wordId, upcoming, responseQuality } = data;
  let query = {};
  // Set pull query depending on which array the card previously belonged to
  if (upcoming) {
    query.$pull = { 'cards.upcoming': wordId };
  } else {
    query.$pull = { 'cards.inProg': wordId };
  };

  // Pull card before getting user to make sure we have updated version of cards arr and query
  // for user in order to find new position of card in array
  const user = await MongoClient.getDb().collection(USER_COLL).findOneAndUpdate({
    _id: ObjectId(userId)
  }, query, {
    returnOriginal: false,
  }).then(res => res.value);

  const card = new Card(user.words[wordId].card);
  const redo = card.processInterval(responseQuality);
  const wordStats = new stats.Word(user.words[wordId].stats.word);
  const userStats = new stats.User(user.stats);
  stats.handleDoCard(responseQuality, wordStats, userStats);

  // Find new position of card
  const pos = getNewCardPos(user, card);

  return MongoClient.getDb().collection(USER_COLL).findOneAndUpdate({ _id: ObjectId(userId) }, {
    $set: {
      [`words.${wordId}.card`]: card,
      [`words.${wordId}.stats.word`]: wordStats,
      stats: userStats
    },
    $push: {
      'cards.inProg': {
        '$each': [ wordId ],
        '$position': pos,
      },
    },
  }, { returnOriginal: false }).then(res => ({ user: res.value, redo }));
}

/**
 * Increments the lookup counter of a word for a particular user and determines
 * if the word should be added to the "upcoming" flashcards array.
 *
 * @param userId     ObjectId
 * @param wordId     ObjectId
 * @param wordJlpt   { level: Number, index: Number }
 * @param kindaKnew  boolean   // Marks whether the user kind of knew the word or didn't at all
 */
exports.increment = async (userId, data) => {
  const { wordId, wordJlpt = { level: 0}, kindaKnew } = data;
  const user = await MongoClient.getDb().collection(USER_COLL).findOne({
    _id: ObjectId(userId),
  });

  // Retrieve and update word entry if exists, otherwise create
  let word = user.words[wordId];

  if (!word) word = createWord();

  let query = {};

  // If no card, do check and create if necessary
  if (word.card === null) {
    var { newCard, isNew } = shouldCreateCard(user.cardData.jlpt, word, wordJlpt.level, kindaKnew);
    if (newCard !== null) {
      word.card = newCard;
      if (isNew) {
        query.$push = { upcoming: ObjectId(wordId) };
      } else {
        query.$push = {
          'cards.inProg': {
            '$each': [ wordId ],
            '$position': getNewCardPos(user, newCard),
          },
        };
      }
    }
    query.$set = { [`words.${wordId}`]: word };
  // Else update existing card
  } else {
    user.cards.inProg = (await pullCard(userId, wordId)).cards.inProg;
    word.card = new Card(word.card);
    word.card.increment(kindaKnew);
    query.$push = {
      'cards.inProg': {
        '$each': [ wordId ],
        '$position': getNewCardPos(user, word.card),
      },
    };
    query.$set = {
      [`words.${wordId}`]: word,
      [user.stats]: userStats, 
    };
  }

  const wordStats = new stats.Word(word.stats);
  const userStats = new stats.User(user.stats);
  stats.handleIncrement(kindaKnew, wordStats, userStats);
  word.stats = wordStats;

  return MongoClient.getDb().collection(USER_COLL).findOneAndUpdate(
    { _id: ObjectId(userId) },
    query,
    { returnOriginal: false },
  ).then(res => res.value);
}

/**
 * Finds the new position in the user inProg cards array for `card` to be placed at.  Make sure to pull
 * the card from user before calling this function.
 *
 * @param user     Object
 * @param card     Object
 * @return Number (new position)
 */
const getNewCardPos = (user, card) => {
  const { inProg } = user.cards;
  let pos = 0;
  
  while (pos < inProg.length && card.date > new Date(user.words[inProg[pos]].card.date)) {
    pos += 1;
  }

  return pos;
}

// Helper function because I needed an async/await way to pull card before pushing into new position
const pullCard = (userId, wordId) => (
  MongoClient.getDb().collection(USER_COLL).findOneAndUpdate({ _id: ObjectId(userId)}, {
    $pull: { 'cards.inProg': wordId }
  }, {
    returnOriginal: false,
  }).then(res => res.value)
);
