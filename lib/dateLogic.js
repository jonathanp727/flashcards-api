// Takes two dates and determines if they are the same day or not
export const isSameDay = (d1, d2 = undefined) => {
  if (!(d1 instanceof Date)) {
    d1 = new Date(d1);
  }
  if (!(d2 instanceof Date)) {
    d2 = new Date(d2);
  }
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}
