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

class KoaShipStore {

  /**
   * Store middleware
   * @param  {Object} app
   */
  constructor(app) {
    this.app = app;
    this.config = _.merge({}, DEFAULT_CONFIG, app.configs.store);
    this.config.models = path.join(app.rootPath, 'app', 'models');

    fs.ensureDirSync(this.config.models);

    this.client = new Client(this.config);
    app.debug('middleware - store loaded');
  }

  /**
   * Close connection
   */
  close() {
    if (!this.client) {
      return false;
    }

    this.client.close();
    this.app.debug('middleware - store close');
  }

}

module.exports = KoaShipStore;