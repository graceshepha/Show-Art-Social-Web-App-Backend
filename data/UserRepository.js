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

  insertOne(info) {
    if (!(info instanceof Object)) throw Error(`Argument must be an instance of Object. Argument given is ${typeof userInfo}`);
    const user = new this.#model(info);
    user.save();
  }
}

module.exports = new UserRepository();
