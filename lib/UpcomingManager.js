const MAX_UPCOMING_SIZE = (dailyNewCardLimit) => dailyNewCardLimit * 5; 

/**
 * Calculation that determines if and where an incremented word should be placed
 * in upcoming.
 *
 * @param word                Object
 * @param word                Object
 * @param upcoming            Array
 * @param words               Object
 * @param dailyNewCardLimit   Number
 * @param userJlpt            Object
 * @return   Number   The index of the upcoming array at which the new card should be inserted or -1
 *                    if it shouldn't be inserted.  If inserting into a full array, delete the last
 *                    element.
 */
const getNewCardIndex = (word, wordJlpt, upcoming, words, dailyNewCardLimit, userJlpt) => {
  if (wordJlpt.level >= userJlpt) {
    return 0;
  }
  return -1;
};

/**
 * Calculation that should be ran prior to a user starting a card session.  Inserts cards if there are
 * not enough and cleans up any irrelevant cards in the case that the user hasn't done any in a while.
 *
 * @param upcoming            Array
 * @param words               Object
 * @param dailyNewCardLimit   Number
 * @return   Object   {
 *    upcoming: The modified upcoming array,
 *    dirty: whether or not the upcoming array has been modified,
 *    numCardsToAdd: TEMPORARY variable to tell model how many cards to grab from dict,
 *  }
 */
const doPreSessionCheck = (upcoming, words, dailyNewCardLimit) => {
  // TODO: implement clean up of old no-longer relevant cards


  // Add cards if upcoming length is less than dailyNewCardLimit
  if (upcoming.length < dailyNewCardLimit) {
    return { dirty: false, numCardsToAdd: dailyNewCardLimit - upcoming.length };
  }

  return { upcoming, dirty: false, numCardsToAdd: 0 };
};

export default {
  MAX_UPCOMING_SIZE,
  getNewCardIndex,
  doPreSessionCheck,
}
