// @ts-check
const debug = require('debug')('backend:UserRepository');
const mongoose = require('mongoose');
const client = require('../utils/database');
const {
  UnknownError, InvalidKey, DuplicatedUnique, EntityNotFound,
} = require('../utils/errors');
/**
 * @typedef {import('../types/schemas.types').User} User
 */

/** @type {mongoose.PaginateOptions} */
const options = {
  lean: true,
  limit: 5,
};

/** @param {string} str */
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
      throw UnknownError(err.message);
    }
  }

  /**
   * Insertion dun likes a un utilisateur
   * @author My-Anh Chau
   */
  async addLikedPost(userid, postid) {
    if (!userid || !postid) throw InvalidKey('Id cannot be null');
    try {
      const user = await this.#model.findByIdAndUpdate(
        userid,
        { $push: { likedPosts: new mongoose.Types.ObjectId(postid) } },
        { new: true },
      );
    } catch (err) {
      debug(err);
      throw UnknownError();
    }
  }

  /**
   * @author My-Anh Chau
   */
  async removeLikedPost(userid, postid) {
    if (!userid || !postid) throw InvalidKey('Id cannot be null');
    try {
      const user = await this.#model.findByIdAndUpdate(
        userid,
        { $pull: { likedPosts: new mongoose.Types.ObjectId(postid) } },
        { new: true },
      );
      if (!user) throw EntityNotFound();
    } catch (err) {
      if (err.name === 'CustomError') { throw err; }
      throw UnknownError();
    }
  }

  /**
   * Insertion d'un post à un utilisateur
   *
   * @param {string | mongoose.Types.ObjectId} userid Id d'un utilisateur
   * @param {string | mongoose.Types.ObjectId} postid Id du post à ajouter
   * @throws {ValidationError|CustomError}
   * @author Roger Montero
   */
  async insertPost(userid, postid) {
    if (!userid || !postid) throw new Error('Id cannot be null');

    const user = await this.#model.findById(userid);
    if (!user) throw EntityNotFound();
    try {
      user.posts.push(new mongoose.Types.ObjectId(postid));
      user.save();
    } catch (err) {
      debug(err);
      throw UnknownError();
    }
  }

  /**
   * Insertion d'un utilisateur à la collection
   *
   * @param {User} info Details d'un utilisateur
   * @returns {Promise<mongoose.Document<User>>} Utilisateur créé
   * @throws {ValidationError|CustomError}
   */
  async initialUpsertOne(info) {
    const userDetails = { ...info };

    let user = await this.findByEmail(info.email);
    if (!user) {
      // new user
      const test = await this.findByUsername(info.username);
      if (test) {
        // username already taken, so create a new temp username
        return this.initialUpsertOne({
          ...info,
          username: withRandom(info.username),
        });
      }
      user = new this.#model(); // new user
    } else delete userDetails.username; // no need to readd username

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
        debug(err);
        const keys = Object.keys(err.keyValue);
        const arr = keys.map((k) => `${k} (${err.keyValue[k]})`);
        throw DuplicatedUnique(`Users cannot share the same ${arr.join(', ')}`);
      } else {
        // UNKNOWN ERROR
        debug(err);
        throw UnknownError();
      }
    }
  }

  /**
   * @param {string} email Courriel de l'utilisateur
   * @returns {Promise<mongoose.Document<User>>}
   */
  async findByEmail(email) {
    return this.#model.findOne({ email });
  }

  /**
   * @param {string} username Username de l'utilisateur
   * @returns {Promise<mongoose.Document<User>>}
   */
  async findByUsername(username) {
    return this.#model.findOne({ username });
  }

  /**
   * @param {string} userId Username de l'utilisateur
   * @returns {Promise<mongoose.Document<User>>}
   *
   */
  async findUserById(userId) {
    return this.#model.findById(userId);
  }

  // find /user/:username/posts
  // find /user/:username/likes
  // find /user/:username/followers
  // find /user/:username/following
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
