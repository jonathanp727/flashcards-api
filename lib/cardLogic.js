function Card (card = null) {
  if (card) {
    this.ef = card.ef;
    this.n = card.n;
    this.interval = card.interval;
    this.date = card.date;
    this.history = card.history;
  } else {
    this.ef = 2.5;
    this.n = 0;
    this.interval = 0;
    this.date = null;
    this.history = [];
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
  },
}

export default Card;
