import { ObjectId } from 'mongodb';

import MongoClient from '../lib/MongoClient';

export const DEFAULT_WORD_SCHEMA = {
  card: null,
  count: 0,
  dates: [],
  upcoming: false,  // States whether the word is in the user's 'upcoming' arr for words that will soon be added to deck
};
