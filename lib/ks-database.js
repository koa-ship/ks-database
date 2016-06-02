'use strict';

var path = require('path');
var fs = require('fs-extra');
var Client = require('./client');

/**
 * Use mongodb as default connection db
 * @type {Object}
 */
const DEFAULT_CONFIG = {
  type: 'sqlite',
  host: '127.0.0.1',
  dbname: 'test'
};

class KoaShipDB {

  /**
   * Database middleware
   * @param  {Object} app
   */
  constructor(app) {
    this.app = app;
    this.config = _.merge({}, DEFAULT_CONFIG, app.configs.database || {}, app.configs.db || {});
    this.config.models = path.join(app.rootPath, 'app', 'models');
    this.config.rootPath = app.rootPath;

    fs.ensureDirSync(this.config.models);

    this.client = new Client(this.config);
    app.debug('middleware - db loaded');
  }

  /**
   * Close connection
   */
  close() {
    if (!this.client) {
      return false;
    }

    this.client.close();
    this.app.debug('middleware - db close');
  }

}

module.exports = KoaShipDB;