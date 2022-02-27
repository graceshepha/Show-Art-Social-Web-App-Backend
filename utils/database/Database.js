// @ts-check
const debug = require('debug')('backend:database');
const mongoose = require('mongoose');
const { NotConnected } = require('../errors');
const schemas = require('./data.schemas');
/**
 * @typedef {import('../../types/schemas.types').User} User
 * @typedef {import('../../types/schemas.types').Post} Post
 * @typedef {import('../../types/schemas.types').Tag} Tag
 */

/**
 * Objet client de la base de donnée qui facilite la création des
 * modèles pour chaque collection de la base de données.
 *
 * @author Roger Montero
 */
class DatabaseClient {
  /**
   * @memberof DatabaseClient
   * @type {mongoose.Connection | undefined}
   */
  #client;

  /**
   * @memberof DatabaseClient
   * @type {boolean}
   */
  #connected;

  /** @constructor DatabaseClient */
  constructor() {
    const {
      DB_ADMIN_USER: user,
      DB_ADMIN_PASSWORD: pass,
      DB_SERVER: server = 'localhost',
      DB_AUTH_SOURCE: authSource,
      DB_PORT: port = '27017',
      DB_DATABASE: dbName = 'test',
    } = process.env;
    if (!user || !pass) throw new Error('Environment variables DB_ADMIN_USER and DB_ADMIN_PASSWORD must be set');
    const params = new URLSearchParams({ retryWrites: 'true', w: 'majority' });
    if (authSource) params.set('authSource', authSource);

    const uri = `mongodb://${user}:${pass}@${server}:${port}/${dbName}?${params.toString()}`;
    if (this.#connected) {
      debug('Database already connected');
      return;
    }
    this.#client = mongoose.createConnection(uri, { dbName, maxPoolSize: 2 });

    // handle error
    this.#client.once('connected', () => {
      debug('Connection successful');
      this.#connected = true;
      this.#initModels();
    });

    this.#client.on('error', (err) => {
      debug(`Error database connection: ${err}`);
      this.#connected = false;
    });
  }

  isConnected() {
    return this.#connected;
  }

  /** Create and initialize models */
  #initModels() {
    // Init just in case
    this.getUserModel();
    this.getPostModel();
    this.getTagModel();
  }

  /**
   * Returns model of a User
   * @returns {schemas.UserModel} User model
   * @throws {DatabaseError}
   */
  getUserModel() {
    if (!this.isConnected) throw NotConnected();
    return this.#client.model('User', schemas.userSchema);
  }

  /**
   * Returns model of a Post
   * @returns {schemas.PostModel} Post model
   * @throws {DatabaseError}
   */
  getPostModel() {
    if (!this.isConnected) throw NotConnected();
    // @ts-ignore
    return this.#client.model('Post', schemas.postSchema);
  }

  /**
   * Returns model of a Tag
   * @returns {schemas.TagModel} Tag model
   * @throws {DatabaseError}
   */
  getTagModel() {
    if (!this.isConnected) throw NotConnected();
    // @ts-ignore
    return this.#client.model('Tag', schemas.tagSchema);
  }

  close() {
    this.#client.close();
    this.#connected = false;
  }
}

module.exports = DatabaseClient;
