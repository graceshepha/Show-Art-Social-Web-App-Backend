// @ts-check
const debug = require('debug')('backend:database');
const mongoose = require('mongoose');
const { client, DatabaseError } = require('../utils/database');

/** @type {mongoose.PaginateOptions} */
const options = {
  lean: true,
  limit: 5,
};

const withRandom = (str) => `${str}-${Math.floor(100000 + Math.random() * 900000)}`;

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
   * @param {mongoose.PaginateOptions} options Options de la pagination
   * @returns {Promise<Object>} Liste de tous les utilisateurs
   */
  async getAll({ offset, page = 1 }) {
    const o = { ...options };
    if (!offset) o.page = page;
    else o.offset = offset;
    o.populate = { path: 'posts' };

    try {
      return await this.#model.paginate({}, o);
    } catch (err) {
      debug(err);
      throw new DatabaseError();
    }
  }

  /**
   * Insert a post `postid` to a user `userid`
   * @param {string | mongoose.Types.ObjectId} userid
   * @param {string | mongoose.Types.ObjectId} postid
   * @author Roger Montero
   */
  async insertPost(userid, postid) {
    if (!userid || !postid) throw new Error('Id cannot be null');

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
   * @param {import('../types/schemas.types').User} info Details d'un utilisateur
   * @returns {Promise<Object>} Utilisateur créé
   * @throws {ValidationError|DatabaseError}
   */
  async initialUpsertOne(info) {
    const userDetails = { ...info };
    let user = await this.#model.findOne({ email: userDetails.email });
    if (user) delete userDetails.username; // no need to add username
    else {
      // new user
      const test = await this.#model.findOne({ username: userDetails.username });
      if (test) {
        // username already taken, so create a new temp one
        return this.initialUpsertOne({
          ...userDetails,
          username: withRandom(userDetails.username),
        });
      }
      user = new this.#model();
    }

    user.set(userDetails);
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
