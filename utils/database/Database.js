// @ts-check
const debug = require('debug')('backend:database');
const mongoose = require('mongoose');
const DatabaseError = require('./DatabaseError');
const schemas = require('./data.schemas');

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
      DB_PORT: port = '27017',
      DB_DATABASE: dbName = 'test',
    } = process.env;
    if (!user || !pass) throw Error('Environment variables DB_ADMIN_USER and DB_ADMIN_PASSWORD must be set');

    const uri = `mongodb://${user}:${pass}@${server}:${port}/${dbName}?retryWrites=true&w=majority`;
    if (this.#connected) {
      debug('Database already connected');
      return;
    }
    this.#client = mongoose.createConnection(uri, { dbName, maxPoolSize: 2 });

    // handle error
    this.#client.once('connected', async () => {
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
    this.getUserModel().init();
    this.getPostModel().init();
    this.getTagModel().init();
  }

  /**
   * Returns model of a User
   * @returns {mongoose.PaginateModel<any>} User model
   * @throws {DatabaseError}
   */
  getUserModel() {
    if (!this.isConnected) throw new DatabaseError(2);
    // @ts-ignore
    return this.#client.model('User', schemas.userSchema);
  }

  /**
   * Returns model of a Post
   * @returns {mongoose.PaginateModel<any>} Post model
   * @throws {DatabaseError}
   */
  getPostModel() {
    if (!this.isConnected) throw new DatabaseError(2);
    // @ts-ignore
    return this.#client.model('Post', schemas.postSchema);
  }

  /**
   * Returns model of a Tag
   * @returns {mongoose.PaginateModel<any>} Tag model
   * @throws {DatabaseError}
   */
  getTagModel() {
    if (!this.isConnected) throw new DatabaseError(2);
    // @ts-ignore
    return this.#client.model('Tag', schemas.tagSchema);
  }

  close() {
    this.#client.close();
    this.#connected = false;
  }
}

module.exports = DatabaseClient;
