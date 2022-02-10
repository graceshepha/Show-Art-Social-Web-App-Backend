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
    const uri = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}?retryWrites=true&w=majority`;

    this.#client = mongoose.createConnection(uri, { useNewUrlParser: true });
    this.#connected = true;

    // handle error
    this.#client.on('error', (e) => {
      this.#connected = false;
      console.error(e);
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
    return this.#getModel('UserAccount', schemas.userSchema);
  }

  getPostModel() {
    return this.#getModel('Post', schemas.postSchema);
  }

  getTagModel() {
    return this.#getModel('Tag', schemas.tagSchema);
  }
}

module.exports = new Database();
