var utils = require('./../lib/utils.js');

require('./../lib/abstract_mixin.js'); 


Mock = function (commandName, next, context) {
  this.times = 0;
  
  this.init(commandName, next, context);
};

console.log(new AbstractMixin());
Mock.prototype = new AbstractMixin();

utils.extend( Mock.prototype, {
  type : "mock",

  perform : function ( cfg ) {
    this.times += 1;
    console.log(this);    
    console.log('HEY GANGSTERS I GOT CALLED ' + this.times + ' TODAY OKAY');

    this.nextTick.apply( this.context, [ this.command, cfg ] ); 
  }

});

exports = module.exports = Mock;