import { isReponseCorrect } from './cardLogic';

// Number of categories (levels) that a given word has
const NUM_CATEGORIES = 5;

/* ALL PUBLIC FUNCTIONS IN `expLogic` */

const expLogic = {
  WordExp: function (other = null) {
    if (other) {
      this.curStreak = other.curStreak;
      this.maxStreak = other.maxStreak;
      this.exp = other.exp;
    } else {
      this.curStreak = 0;
      this.maxStreak = 0;
      this.exp = 0; // Max 100
    }
  },
  UserExp: function (other = null) {
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
  processDoCard: function (response, wordExp, userExp) {
    const prevCategory = wordExp.getCategory(wordExp);
    wordExp.processDoCard(response);
    const newCategory = wordExp.getCategory(wordExp);
    userExp.processWordDif(prevCategory, newCategory);
  },
  processIncrement: function (kindaKnew, wordExp, userExp) {
    const prevCategory = wordExp.getCategory(wordExp);
    wordExp.processIncrement(response);
    const newCategory = wordExp.getCategory(wordExp);
    userExp.processWordDif(prevCategory, newCategory);
  },
}

/* PRIVATE FUNCTIONS -- DO NOT CALL THESE OUTSIDE OF THIS FILE */

// All word exp logic is in these functions
const calculateCurrentCategory = exp => exp / (100 / NUM_CATEGORIES);
const calculateWordExpGains = (exp, reponse) => exp + 10 < 100 ? exp + 10 : 100;
const calculateWordExpLosses = (exp, reponse) => exp - 50 > 0 ? exp - 50 : 0;
const calculateWordKindaKnewIncrement = exp => exp - 50 > 0 ? exp - 50 : 0;
const calculateWordDidntKnowIncrement = exp => 0;

expLogic.WordExp.prototype = {
  constructor: expLogic.WordExp,
  processDoCard: function (response) {
    if (!isReponseCorrect(response)) {
      this.exp = calculateWordExpLosses(this.exp, response);
      this.curStreak = 0;
    } else {
      this.exp = calculateWordExpGains(this.exp, response);
      this.curStreak += 1;
      this.maxStreak = Math.max(this.curStreak, this.maxStreak);
    }
  },
  processIncrement: function (kindaKnew) {
    this.curStreak = 0;
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

expLogic.UserExp.prototype = {
  constructor: expLogic.UserExp,
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

export default expLogic;
