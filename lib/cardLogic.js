/** 
 * Given a response value (1-5) returns whether the response indicates the user was correct.  This is
 * only used once in this file, but is necessary for other parts of application.  (expLogic)
 */
export const isReponseCorrect = response => response >= 3;

function Card (card = null) {
  if (card) {
    this.ef = card.ef;
    this.n = card.n;
    this.interval = card.interval;
    this.date = card.date;
    // `caution` is a boolean value that is set to true when an existing card was kindaKnew incremented and before it's
    // next appearance in the flashcard deck.  If a card is incremented again before it's next appearance in the flashcard
    // deck, reset card regardless of kindaKnew.
    this.caution = card.caution;
  } else {
    this.date = null;
    this._reset();
  }
}

Card.prototype = {
  constructor: Card,
  // Processes card after it's done by user, returns whether user was correct or not (whether they should redo)
  processInterval: function (response) {
    this.caution = false;

    const isCorrect = isReponseCorrect(response);
    if (!isCorrect) {
      this.n = 1;
    } else {
      this.n += 1;
    }

    this.ef = this.ef + (0.1 - (5 - response) * (0.08 + (5 - response) * 0.02));

    if (this.ef < 1.3) this.ef = 1.3;

    if (this.n == 1) {
      this.interval = 1;
    } else if (this.n == 2) {
      this.interval = 6;
    } else {
      this.interval = this.interval * this.ef;
      this.interval = Math.round(this.interval);
    }

    this.date = new Date();
    this.date.setHours(0,0,0,0); // Set hours, minutes, seconds, and milliseconds to 0
    this.date.setDate(this.date.getDate() + this.interval);

    return isCorrect;
  },
  increment: function (kindaKnew) {
    if (kindaKnew && !this.caution) {
      this._softReset(true);
    } else {
      this._reset();
      this.date = new Date();
      this.date.setHours(0,0,0,0); // Set hours, minutes, seconds, and milliseconds to 0
      this.date.setDate(this.date.getDate() + 1);
    }
  },
  // Resets card to behave as completely new
  _reset: function () {
    this.ef = 2.5;
    this.n = 0;
    this.interval = 0;
    this.caution = false;
  },
  _softReset: function (lowerEF = false) {
    this.date = new Date();
    this.date.setHours(0,0,0,0); // Set hours, minutes, seconds, and milliseconds to 0
    this.interval = 7;
    this.date.setDate(this.date.getDate() + this.interval);
    this.n = 3;
    this.caution = true;

    if (lowerEF) {
      // Lower EF using regular EF adjusting equation with a response value of 3
      this.ef = this.ef + (0.1 - (2) * (0.08 + (2) * 0.02));
    }
  },
}

/**
 * Calculation to determine whether a lookup should translate into a new card
 *
 * @param user      [Object]
 * @param word      [Object]
 * @param wordJlpt  [Object]
 * @param kindaKnew boolean
 * @return [Object]
 *    newCard: [Object] // The card to be created or null if card should not be created
 *    isNew: boolean // Whether the card is a fresh new card or if it has parematers set to perform
 *                   // differently or show up on a specific date, 
 */
export const shouldCreateCard = (userJlpt, word, wordJlpt, kindaKnew) => {
  if (kindaKnew) {
     // Return a card that is set to be done in 7 days
    const newCard = new Card();
    newCard._softReset();
    return { newCard, isNew: false };
  } else {
    // if word jlpt is at or above the user's level, OR it's at the next level
    if (wordJlpt >= userJlpt.level || word.count > 3) {
      return { newCard: new Card(), isNew: true };
    }
    return { newCard: null };
  }
};

export default Card;
