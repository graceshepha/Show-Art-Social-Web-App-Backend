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
   * L'instance du client
   *
   * @memberof DatabaseClient
   * @type {mongoose.Connection | undefined}
   */
  #client;

  /**
   * L'état de la base de donnéee
   *
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

  /**
   * Le état du client de la base de donnée
   *
   * @return {boolean} True si la base de donnée est connectée
   * @memberof DatabaseClient
   */
  isConnected() {
    return this.#connected;
  }

  /**
   * Initialise les modèles
   *
   * @memberof DatabaseClient
   */
  #initModels() {
    // Init just in case
    this.getUserModel();
    this.getPostModel();
    this.getTagModel();
  }

  /**
   * Crée le modèle des utilisateurs et le retourne
   *
   * @returns {schemas.UserModel} User model
   * @throws {DatabaseError}
   * @memberof DatabaseClient
   */
  getUserModel() {
    if (!this.isConnected) throw NotConnected();
    return this.#client.model('User', schemas.userSchema);
  }

  /**
   * Crée le modèle des posts et le retourne
   *
   * @returns {schemas.PostModel} Post model
   * @throws {DatabaseError}
   * @memberof DatabaseClient
   */
  getPostModel() {
    if (!this.isConnected) throw NotConnected();
    return this.#client.model('Post', schemas.postSchema);
  }

  /**
   * Crée le modèle des tags et le retourne
   *
   * @returns {schemas.TagModel} Tag model
   * @throws {DatabaseError}
   * @memberof DatabaseClient
   */
  getTagModel() {
    if (!this.isConnected) throw NotConnected();
    // @ts-ignore
    return this.#client.model('Tag', schemas.tagSchema);
  }

  /**
   * Closes the database
   *
   * @memberof DatabaseClient
   */
  close() {
    this.#client.close();
    this.#connected = false;
  }
}

module.exports = DatabaseClient;
