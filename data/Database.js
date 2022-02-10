const debug = require('debug')('backend:database');
const mongoose = require('mongoose');
const schemas = require('./schemas');

/**
 * Objet client de la base de donnée qui facilite la création des
 * modèles pour chaque collection de la base de données.
 *
 * @author Roger Montero
 */
class Database {
  #client;

  #connected;

  constructor() {
    const {
      DB_ADMIN_USER: user,
      DB_ADMIN_PASSWORD: pass,
      DB_SERVER: server = 'localhost',
      DB_PORT: port = '27017',
      DB_DATABASE: db = '',
    } = process.env;
    if (!user || !pass) throw Error('Environment variables DB_ADMIN_USER and DB_ADMIN_PASSWORD must be set');

    const uri = `mongodb://${user}:${pass}@${server}:${port}/${db}?retryWrites=true&w=majority`;

    this.#client = mongoose.createConnection(uri, { useNewUrlParser: true });
    this.#connected = true;

    // handle error
    this.#client.once('connected', async () => {
      debug('Connection successful');
    });

    this.#client.on('error', (err) => {
      debug(`Error database connection: ${err}`);
      this.#connected = false;
      this.#client.close();
    });
  }

  isConnected() {
    return this.#connected;
  }

  #getModel(name, schema) {
    if (!this.isConnected) throw Error('Database is not connected');
    return this.#client.model(name, schema);
  }

  getUserModel() {
    return this.#getModel('User', schemas.userSchema);
  }

  getPostModel() {
    return this.#getModel('Post', schemas.postSchema);
  }

  getTagModel() {
    return this.#getModel('Tag', schemas.tagSchema);
  }
}

module.exports = new Database();
