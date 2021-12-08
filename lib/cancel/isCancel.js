'use strict';

// 是Cancel实例吗
module.exports = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};
