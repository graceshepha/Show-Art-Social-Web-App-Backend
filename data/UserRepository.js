// @ts-check
const debug = require('debug')('backend:database');
const { client, DatabaseError } = require('../utils/database');

/**
 * Dépot d'un utilisateur qui possède tous les fonctions pour CRUD
 * d'un utilisateur dans l'application.
 *
 * @author Roger Montero
 */
class UserRepository {
  #model;

  /** @constructor */
  constructor() {
    this.#model = client.getUserModel();
  }

  /**
   * Insertion d'un utilisateur
   *
   * @param {Object<string,*>} info
   * @returns {Promise<Object>} User created
   * @throws {ValidationError|DatabaseError}
   */
  async insertOne(info) {
    const user = new this.#model(info);
    // VALIDATE
    try {
      await this.#model.validate(user);
      return await user.save();
    } catch (err) {
      if (err.name === 'ValidationError') {
        debug(err);
        throw err;
      } else if (err.code === 11000) {
        // DUPLICATED
        const [key] = Object.keys(err.keyValue);
        const e = new DatabaseError(3, `Two users cannot share the same ${key} (${err.keyValue[key]})`);
        debug(e);
        throw e;
      } else {
        // UNKNOWN ERROR
        const e = new DatabaseError();
        debug(e);
        throw e;
      }
    }
  }
}

/*
  how to get errors and values of ValidationError

  const errors = Object.keys(err.errors);
  errors.map((e) => {
    const error = err.errors[e];
    return {
      type: error.kind,
      path: error.path,
      message: error.message,
    };
  });
*/

module.exports = new UserRepository();
