'use strict';

var _ = require('lodash');
var inspector = require('class-inspector');
var define = require('./define');

module.exports = function loadClass(name, klass, filename) {

  let methods = inspector(klass);
  let staticMethods = methods.staticMethods;
  let instanceMethods = methods.instanceMethods;

  let schema = klass.schema();
  let model = define(name, klass, filename);

  _.forEach(staticMethods, (method, name) => {
    if (typeof method.value == 'function') model[name] = method.value;
  });

  _.forEach(instanceMethods, (method, name) => {
    model.prototype[name] = method.value;
  });

  return model;
};