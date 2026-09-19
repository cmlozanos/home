/* From ybrodsky/gravity/src/gravity.js, MIT, Copyright (c) 2016 Yael Brodsky.
 * Original inverse-square acceleration implementation; see LICENSE.gravity. */
var Gravity = function() {
  this.constant = 6.67384 * Math.pow(10, -11);
};
Gravity.prototype.calculateAcceleration = function(mass, distance) {
  return (this.constant * mass) / Math.pow(distance, 2);
};
