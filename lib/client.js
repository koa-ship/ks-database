'use strict';

var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var requireAll = require('require-all');

class Client {

  /**
   * Client constructor
   * @param  {object} config connection config
   * @return {object}        client object
   */
  constructor(config) {
    this.checkConfig();

    this.basePath = path.join(config.models, 'base');
    this.baseModel = path.join(this.basePath, 'Model.js');

    this.exposeBaseModels();
    this.conn = this.connect();
  }

  checkConfig() {
    // TODO: pre check config options
  }

  exposeBaseModels() {
    if (this.fileExists(this.baseModel)) {
      global['Model'] = require(this.baseModel);
    }

    if (this.fileExists(this.basePath)) {
      let classes = requireAll({
        dirname : this.basePath,
        recursive: false,
        filter : /(.+)\.js$/
      });

      _.forEach(classes, (klass, name) => {
        if (!global[name]) {
          global[name] = klass;
        }
      }); 
    }
  }

  fileExists(file) {
    try {
      fs.statSync(file);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Create client
   * @return {Object}
   */
  connect() {
    let adapter = this.getAdapter(this.config.type);
    let Adapter = require(path.join(__dirname, 'adapters', adapter));

    return new Adapter(this.config);
  }

  /**
   * Get adapter by type
   * @param  {String} type Database type
   * @return {String}      adapter
   */
  getAdapter(type) {
    let adapter = 'mongoose';

    switch (type) {
      case 'mongodb':
        adapter = 'mongoose';
        break;
      case 'mysql':
      case 'mariadb':
      case 'sqlite':
      case 'postgres':
      case 'mssql':
        adapter = 'sequelize';
      default:
        break;
    }

    return adapter;
  }  

  /**
   * Close connection
   */
  close() {
    if (!this.conn) {
      return false;
    }

    this.conn.close();
  }  

}

module.exports = Client;
