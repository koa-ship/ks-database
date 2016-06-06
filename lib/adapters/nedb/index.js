'use strict';

var path = require('path');
var fs = require('fs-extra');
var _ = require('lodash');
var requireAll = require('require-all');
var loadClass = require('./loadClass');

class Client {

  constructor(config) {
    this.config = config;
    if (this.config.storage) {
      this.storage = path.join(this.config.rootPath, this.config.storage);
    } else {
      this.storage = path.join(this.config.rootPath, 'data', 'db');
    }

    fs.ensureDirSync(this.storage);

    this.connect();
    this.exposeGlobals();    
  }

  connect() {
    
  }

  exposeGlobals() {
    const self = this;

    let classes = requireAll({
      dirname : this.config.models,
      recursive: false,
      filter : /(.+)\.js$/
    });

    _.forEach(classes, (klass, name) => {
      global[name] = self.createModel(name, klass);
    }); 
  }

  createModel(name, klass) {
    let schema = klass.schema();
    let tableName = schema.name || _.lowerCase(name);
    let filename = path.join(this.storage, `${tableName}.db`);

    return loadClass(name, klass, filename);
  }

  close() {
  }

}

module.exports = Client;
