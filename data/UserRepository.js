// @ts-check
const debug = require('debug')('backend:database');
const mongoose = require('mongoose');
const { client, DatabaseError } = require('../utils/database');

/** @type {import('mongoose').PaginateOptions} */
const options = {
  lean: true,
  limit: 5,
};

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
   * Trouver tous les documents de la collection
   *
   * @param {import('mongoose').PaginateOptions} options Options de la pagination
   * @returns {Promise<Object>} Liste de tous les utilisateurs
   */
  async getAll({ offset, page = 1 }) {
    const o = { ...options };
    if (!offset) o.page = page;
    else o.offset = offset;
    o.populate = 'posts';

    try {
      return await this.#model.paginate({});
    } catch (err) {
      debug(err);
      throw new DatabaseError();
    }
  }

  /**
   * Insert a post `postid` to a user `userid`
   *
   * @author Roger Montero
   */
  async insertPost(userid, postid) {
    const user = await this.#model.findById(userid);
    if (!user) throw new DatabaseError(4);
    try {
      user.posts.push(new mongoose.Types.ObjectId(postid));
      user.save();
    } catch (err) {
      debug(err);
      throw new DatabaseError(1);
    }
  }

  /**
   * Insertion d'un utilisateur à la collection
   *
   * @param {Object<string,*>} info Details d'un utilisateur
   * @returns {Promise<Object>} Utilisateur créé
   * @throws {ValidationError|DatabaseError}
   */
  async insertOne(info) {
    let user = await this.#model.findOne({ email: info.email }).exec();
    if (!user) user = new this.#model(info);
    else user.set(info);
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
        debug(err);
        throw new DatabaseError(
          3,
          `Two users cannot share the same ${key} (${err.keyValue[key]})`,
        );
      } else {
        // UNKNOWN ERROR
        debug(err);
        throw new DatabaseError();
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
