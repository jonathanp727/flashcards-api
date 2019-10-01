function Card (card = null) {
  if (card) {
    this.ef = card.ef;
    this.n = card.n;
    this.interval = card.interval;
    this.date = card.date;
    this.history = card.history;
  } else {
    this.history = [];
    this.date = null;
    this.reset();
  }
}

Card.prototype = {
  constructor: Card,
  processInterval: function (response) {
    if (response < 3) {
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
    this.history.push(this.date);
  },
  increment: function (kindaKnew) {
    if (!kindaKnew) {
      this.reset();
      this.date = new Date();
      this.date.setHours(0,0,0,0); // Set hours, minutes, seconds, and milliseconds to 0
      this.date.setDate(this.date.getDate() + 1);
    }
  },
  reset: function () {
    this.ef = 2.5;
    this.n = 0;
    this.interval = 0;
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
export const shouldCreateCard = (user, word, wordJlpt, kindaKnew) => {
  if (kindaKnew) {
     // Return a card that is set to be done in 7 days
    const card = new Card();
    card.date = new Date();
    card.date.setHours(0,0,0,0); // Set hours, minutes, seconds, and milliseconds to 0
    card.interval = 7;
    card.date.setDate(card.date.getDate() + card.interval);
    card.n = 3;
    return { newCard: card, isNew: false };
  } else {
    // if word jlpt is at or above the user's level, OR it's at the next level
    if (wordJlpt >= user.jlpt.level || word.count > 3) {
      return { newCard: new Card(), isNew: true };
    }
    return { newCard: null };
  }
};

export default Card;
