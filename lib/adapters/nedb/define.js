'use strict';

var _ = require('lodash');
var Datastore = require('nedb');

module.exports = function(name, klass, filename) {
  let db = new Datastore({ filename: filename, autoload: true });

  let Model = function() {};

  /////////////////////////////////// static ///////////////////////////////////
  Model.findOne = function(query, options) {
    const self = this;
    options = options || {};

    return new Promise((resolve, reject) => {
      db.findOne(query)
        .projection(options.projection)
        .exec((err, obj) => {
        if (err) {
          return reject(err);
        }

        if (obj) {
          resolve(self.make(obj));
        } else {
          resolve(null);
        }
      });
    });
  };

  Model.find = function(query, options) {
    const self = this;
    options = options || {};

    return new Promise((resolve, reject) => {
      db.find(query)
        .sort(options.sort)
        .skip(options.skip)
        .limit(options.limit)
        .projection(options.projection)
        .exec((err, objs) => {
        if (err) {
          return reject(err);
        }

        let items = [];
        _.forEach(objs, (obj) => {
          items.push(self.make(obj));
        });
        
        resolve(items);
      });
    });
  };

  Model.update = function(query, update, options) {
    const self = this;
    options = options || {};

    return new Promise((resolve, reject) => {
      options.returnUpdatedDocs = true;

      db.update(query, update, options, (err, numAffected, affectedDocuments, upsert) => {
        if (err) {
          return reject(err);
        }

        resolve({
          numAffected: numAffected,
          affectedDocuments: affectedDocuments,
          upsert: upsert,
        });
      });
    });
  };

  Model.count = function(query) {
    const self = this;

    return new Promise((resolve, reject) => {
      db.count(query, (err, count) => {
        if (err) {
          return reject(err);
        }
        resolve(count);
      });
    });
  };

  Model.make = function(obj) {
    const instance = new this();
    _.forEach(obj, (value, key) => {
      instance[key] = value;
    });

    return instance;
  };

  /////////////////////////////////// instance /////////////////////////////////
  Model.prototype.save = function() {
    const self = this;

    let obj = {};
    _.forEach(schema.fields, (rule, name) => {
      obj[name] = self[name];
    });

    return new Promise((resolve, reject) => {
      db.update({_id: self._id}, obj, {upsert: true}, (err, numReplaced, upsert) => {
        if (err) {
          return reject(err);
        }        
        resolve(self.make(upsert));
      });
    });
  };

  Model.prototype.make = function(obj) {
    const instance = this;
    _.forEach(obj, (value, key) => {
      instance[key] = value;
    });

    return instance;
  };

  return Model;  
};