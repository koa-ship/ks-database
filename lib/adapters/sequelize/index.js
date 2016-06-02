'use strict';

var path = require('path');
var fs = require('fs');
var _ = require('lodash');

var Sequelize = require('sequelize');
var loadClass = require('./loadClass');

class Client {

  constructor(config) {
    this.config = config;

    this.connect();
    this.exposeGlobals();    
  }

  connect() {
    let dbname = this.config.dbname || 'test';
    let user = this.config.user || null;
    let password = this.config.password || null;
    let options = {
      host: this.config.host || '127.0.0.1',
      dialect: this.config.type,
      pool: { max: 5, min: 0, idle: 10000 },
      timezone: this.config.timezone || 'Asia/Shanghai',
    };

    if (this.config.type == 'sqlite') {
      options['timezone'] = '+00:00';
      options['storage'] = path.join(this.config.rootPath, this.config.storage);
    }

    this.sequelize = new Sequelize(dbname, user, password, options);
  }

  exposeGlobals() {
    const self = this;

    global['Sequelize'] = Sequelize;

    let classes = _.requireAll({
      dirname : this.config.models,
      recursive: false,
      filter : /(.+)\.js$/
    });

    let models = [];
    _.forEach(classes, (klass, name) => {
      global[name] = self.createModel(name, klass);
      models.push(klass);
    });

    // Load relations
    _.forEach(models, (klass) => {
      if (typeof klass['init'] == 'function') {
        klass.init();
      }
    });
  }

  createModel(name, klass) {
    return loadClass(this.sequelize, name, klass);
  }

  close() {
    this.sequelize.close();
  }
}

module.exports = Client;
