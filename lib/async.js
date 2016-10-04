const co = require('co');

const safeAsync = function (gen) {
  var fn = co.wrap(gen);

  return function () {
    Promise.resolve(fn.apply(this, arguments)).catch(function (err) {
      console.log(err);
    });
  };
};

module.exports = {
  safeAsync
};
