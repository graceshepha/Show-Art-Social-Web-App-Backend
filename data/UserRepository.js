const debug = require('debug')('backend:database');
const client = require('./Database');

/**
 * Dépot d'un utilisateur qui possède tous les fonctions pour CRUD
 * d'un utilisateur dans l'application.
 *
 * @author Roger Montero
 */
class UserRepository {
  #model;

  constructor() {
    this.#model = client.getUserModel();
  }

  /**
   * Insertion d'un utilisateur
   */
  async insertOne(info) {
    if (!(info instanceof Object)) throw Error(`Argument must be an instance of Object. Argument given is ${typeof userInfo}`);
    const user = new this.#model(info);
    const returning = {
      error: false,
    };
    // VALIDATE
    try {
      await this.#model.validate(user);
      returning.result = await user.save();
    } catch (err) {
      returning.error = true;
      if (err.name === 'ValidationError') {
        debug(err.errors);
        // GET ERRORS AND MESSAGES
        const errors = Object.keys(err.errors);
        returning.errors = errors.map((e) => {
          const error = err.errors[e];
          return {
            type: error.kind,
            path: error.path,
            message: error.message,
          };
        });
      } else if (err.code === 11000) {
        // DUPLICATED
        const [key] = Object.keys(err.keyValue);
        const message = `Two users cannot share the same ${key} (${err.keyValue[key]})`;
        returning.errors = [{
          type: 'duplicated',
          path: key,
          message,
        }];
        debug(message);
      } else {
        // UNKNOWN ERROR
        returning.errors = [
          {
            type: 'unknownError',
            message: 'An error occured inserting the user',
          }];
        debug(err);
      }
    }
    return returning;
  }
}

module.exports = new UserRepository();
