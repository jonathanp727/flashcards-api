import { isReponseCorrect } from './cardLogic';

// Number of categories (levels) that a given word has
const NUM_CATEGORIES = 5;

/* ALL PUBLIC FUNCTIONS IN `stats` */

const stats = {
  Word: function (other = null) {
    if (other) {
      this.inc = other.inc;
      this.card = other.card;
      this.exp = other.exp;
    } else {
      this.inc = {
        count: 0,
        dates: [],
      };
      this.card = {
        curStreak: 0,
        maxStreak: 0,
        history: [],
      };
      this.exp = 0; // Max 100
    }
  },
  User: function (other = null) {
    if (other) {
      this.categories = other.categories;
      this.exp = other.exp;
      this.level = other.level;
    } else {
      // Count of all words in each category
      this.categories = new Array(NUM_CATEGORIES).fill(0);
      this.exp = 0;
      this.level = 1;
    }
  },
  // public function that handles all stats handling of a `doCard` action
  handleDoCard: function (response, wordStats, userStats) {
    const prevCategory = wordStats.getCategory(wordStats);
    wordStats.processDoCard(response);
    const newCategory = wordStats.getCategory(wordStats);
    userStats.processWordDif(prevCategory, newCategory);
  },
  // public function that handles all stats handling of an `increment` action
  handleIncrement: function (kindaKnew, wordStats, userStats) {
    const prevCategory = wordStats.getCategory(wordStats);
    wordStats.processIncrement(response);
    const newCategory = wordStats.getCategory(wordStats);
    userStats.processWordDif(prevCategory, newCategory);
  },
}

/* PRIVATE FUNCTIONS -- DO NOT CALL THESE OUTSIDE OF THIS FILE */

const MAX_WORD_EXP = 100;

// All word exp logic is in these functions
const calculateCurrentCategory = exp => exp / (100 / NUM_CATEGORIES);
const calculateWordExpGains = (exp, reponse) => exp + 10 < MAX_WORD_EXP ? exp + 10 : MAX_WORD_EXP;
const calculateWordExpLosses = (exp, reponse) => exp - 50 > 0 ? exp - 50 : 0;
const calculateWordKindaKnewIncrement = exp => exp - 50 > 0 ? exp - 50 : 0;
const calculateWordDidntKnowIncrement = exp => 0;

stats.Word.prototype = {
  constructor: stats.Word,
  processDoCard: function (response) {
    this.card.history.push({ date: new Date().getTime(), response });
    if (!isReponseCorrect(response)) {
      this.exp = calculateWordExpLosses(this.exp, response);
      this.card.curStreak = 0;
    } else {
      this.exp = calculateWordExpGains(this.exp, response);
      this.card.curStreak += 1;
      this.card.maxStreak = Math.max(this.curStreak, this.maxStreak);
    }
  },
  processIncrement: function (kindaKnew) {
    this.curStreak = 0;
    this.inc.dates.push({ date: new Date().getTime(), kindaKnew });
    this.inc.count += 1;
    if (kindaKnew) {
      this.exp = calculateWordKindaKnewIncrement(this.exp);
    } else {
      this.exp = calculateWordDidntKnowIncrement(this.exp);
    }
  },
  // Calculation that determines the category (level) of the word
  getCategory: function() {
    return calculateCurrentCategory(this.exp);
  }
}

// All user exp logic is in these functions
const calculateUserExpGains = newCategory => newCategory / NUM_CATEGORIES * 10;
const calculateExpToNextLevel = level => level * 50;

stats.User.prototype = {
  constructor: stats.User,
  /**
   * To be called whenever a word has it's exp modified.  If the word has a change in category
   * then calculates new user exp
   */
  processWordDif: function (prevCategory, newCategory) {
    if (prevCategory === newCategory) return;
    this.categories[prevCategory] -= 1;
    this.categories[newCategory] += 1;

    if (newCategory > prevCategory) {

      this.exp += calculateUserExpGains(newCategory);

      const expNeeded = calculateExpToNextLevel(user.level);
      if (this.exp >= expNeeded) {
        this.level += 1;
        this.exp -= expNeeded;
      }
    }
  },
}

export default stats;
