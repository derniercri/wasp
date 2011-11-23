var utils = require('./../lib/utils.js');

Mock = function () {
  this.times = 0;
};

Mock.prototype = {
  type : "mock",

  perform : function() {
    this.times++;
    console.log('HEY GANGSTERS I GET CALL ' + this.times + ' TODAY OKAY');
  }

};
exports = module.exports = Mock;