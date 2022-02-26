// @ts-check
const debug = require('debug')('backend:database');
const mongoose = require('mongoose');
const client = require('../utils/database');
const {
  UnknownError, DuplicatedUnique, EntityNotFound, InvalidKey,
} = require('../utils/errors');
/**
 * @typedef {import('../types/schemas.types').User} User
 */

/**
 * @ignore
 * @type {mongoose.PaginateOptions}
 */
const options = {
  lean: true,
  limit: 5,
};

/**
 * @ignore
 * @param {string} str
 */
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
    const o = {
      ...options,
      path: 'posts',
    };
    if (!offset) o.page = page;
    else o.offset = offset;

    try {
      return await this.#model.paginate({}, o);
    } catch (err) {
      debug(err);
      throw UnknownError(err.message);
    }
  }

  // UserRepo: addLikedPost(postid) / removeLikedPost(postid)
  /**
   * @author My-Anh Chau
   */
  // Insertion dun likes a un utilisateur
  // chaque utilisateur a un id
  async addLikedPost(userid, postid) {
    // userOwner doit avoir userliker ds sa liste de like
    // userliker doit avoir userOwner ds sa liste de addlikedPost
    //
    // userid celui qui like
    // postid post qui est like
    //
    if (!userid || !postid) throw new Error('Id cannot be null');
    // veut recevoir le post a ajouter postid mais aussi recevoir = postid
    // une facon dideentifier utilisateur qui a like = userid
    // objet d'un utilisateur qui a post
    // get utilisateur qui a like
    // get utilisateur qui se fait like
    // const userOwner = await postRepository.findById(postid);
    try {
      const userLiker = await this.#model.findById(userid).exec();
      if (!userLiker) throw EntityNotFound();
      // get userLiker a avoir ses like de user
      // userOwner.meta.likes.push(new mongoose.Types.ObjectId(userid));
      //  insert dans userLiker son likedpost
      userLiker.likedPosts.push(new mongoose.Types.ObjectId(postid));
      // userOwner.save();
      await userLiker.save();
    } catch (err) {
      debug(err);
      throw UnknownError();
    }
  }

  /**
   * @author My-Anh Chau
   */
  async removeLikedPost(userid, postid) {
    if (!userid || !postid) throw new Error('Id cannot be null');
    // objet d'un utilisateur qui a post
    const userLiker = await this.#model.findById(postid).exec();
    // apelle de la fonct bd pr ajouter
    try {
      // findbyidDelete or findbyidRemove
      userLiker.likedPosts.findByIdAndDelete(new mongoose.Types.ObjectId(postid));
      userLiker.save();
    } catch (err) {
      debug(err);
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

    try {
      const user = await this.#model.findByIdAndUpdate(
        userid,
        { $push: { posts: new mongoose.Types.ObjectId(postid) } },
        { new: true },
      );
      if (!user) throw EntityNotFound();
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
   * @returns {Promise<mongoose.Document<User> | null>}
   */
  async findByEmail(email) {
    try {
      const user = this.#model.findOne({ email }).exec();
      return user;
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
  }

  /**
   * @param {string} username Username de l'utilisateur
   * @returns {Promise<mongoose.Document<User> | null>}
   */
  async findByUsername(username) {
    try {
      const user = this.#model.findOne({ username }).exec();
      return user;
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
  }

  /**
   * @param {string | mongoose.Types.ObjectId} userId Id de l'utilisateur
   * @returns {Promise<mongoose.Document<User> | null>} Utilisateur
   * @author My-Anh Chau
   */
  async findUserById(userId) {
    try {
      const user = this.#model.findById(userId).exec();
      return user;
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
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
