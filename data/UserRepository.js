// @ts-check
const debug = require('debug')('backend:UserRepository');
const mongoose = require('mongoose');
const client = require('../utils/database');
const {
  UnknownError, DuplicatedUnique, EntityNotFound, InvalidKey,
} = require('../utils/errors');
/**
 * @typedef {import('../types/schemas.types').User} User
 * @typedef {mongoose.HydratedDocument<User>} UserDocument
 * @typedef {mongoose.PaginateDocument<User, {}>} UserPaginatedDocument
 * @typedef {mongoose.PaginateResult<UserPaginatedDocument>} UserPaginatedResult
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
 * Dépot d'un utilisateur qui possède tous les fonctions CRUD
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
   * @param {string} search Filtre (by username)
   * @param {mongoose.PaginateOptions} options Options de la pagination
   * @returns {Promise<UserPaginatedResult>} Liste de tous les utilisateurs
   *
   * @author Roger Montero
   */
  async getAll(search, { select, page = 1 }) {
    const o = {
      ...options,
      page,
      select,
    };
    o.populate = { path: 'posts' };

    const searchFilter = search ? { username: { $regex: new RegExp(search, 'i') } } : {};

    try {
      const u = await this.#model.paginate(searchFilter, o);
      return u;
    } catch (err) {
      debug(err);
      throw UnknownError(err.message);
    }
  }

  /**
   * Insertion dun likes dans le array de likedPost
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
      if (!user) throw EntityNotFound();
    } catch (err) {
      debug(err);
      if (err.name === 'CustomError') { throw err; }
      throw UnknownError();
    }
  }

  /**
   * Effacer le postId dans le array de likedPost
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
   * Insertion d'un post au document d'un utilisateur
   *
   * @param {string | mongoose.Types.ObjectId} userid Id d'un utilisateur
   * @param {string | mongoose.Types.ObjectId} postid Id du post à ajouter
   * @throws {ValidationError|CustomError}
   * @author Roger Montero
   *
   * @author Roger Montero
   */
  async insertPost(userid, postid) {
    if (!userid || !postid) throw new Error('Id cannot be null');

    try {
      const user = await this.#model.findByIdAndUpdate(
        userid,
        { $push: { posts: new mongoose.Types.ObjectId(postid) } },
        { new: true },
      ).exec();
      if (!user) throw EntityNotFound();
    } catch (err) {
      debug(err);
      throw InvalidKey();
    }
  }

  /**
   * Insertion conditionnelle d'un utilisateur à la collection, change le username
   * passé dans l'objet s'il existe déjà un utilisateur avec ce username.
   *
   * Il est important à savoir: si un utilisateur existe déjà avec le courriel passé,
   * cette méthode n'essaie pas d'insérer son courriel ni son username.
   *
   * Cette méthode est utilisé pour la requête suite à la connexion d'un utilisateur.
   *
   * @param {User} info Details d'un utilisateur
   * @returns {Promise<UserDocument>} Utilisateur créé ou modifié
   * @throws {ValidationError|CustomError}
   *
   * @author Roger Montero
   */
  async initialUpsertOne(info) {
    const userDetails = { ...info };

    let user = await this.findByEmail(info.email);
    if (!user) {
      // new user
      const test = await this.findByUsername(info.username);
      if (test) {
        // username already taken, so create another username
        return this.initialUpsertOne({
          ...info,
          username: withRandom(info.username),
        });
      }
      user = new this.#model(); // new user
    } else delete userDetails.username; // no need to readd username

    user.set(userDetails);
    try {
      await user.validate();
      return await user.save();
    } catch (err) {
      // verify type of error
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
   * Trouve un utilisateur avec son courriel.
   *
   * @param {string} email Courriel de l'utilisateur
   * @returns {Promise<UserDocument | null>} Document de l'utilisateur trouvé ou `null`.
   * @throws {CustomError}
   *
   * @author Roger Montero
   */
  async findByEmail(email) {
    if (!email) throw InvalidKey('Email was not received');
    try {
      return await this.#model
        .findOne({ email })
        .exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
  }

  /**
   * Trouve toutes les informations d'un utilisateur avec son courriel.
   *
   * @param {string} email Courriel de l'utilisateur
   * @returns {Promise<UserDocument | null>} Document de l'utilisateur trouvé ou `null`.
   * @throws {CustomError}
   *
   * @author Roger Montero
   */
  async findAllUserInfoByEmail(email) {
    if (!email) throw InvalidKey('Email was not received');
    try {
      return await this.#model
        .findOne({ email })
        .populate('posts')
        .populate('likedPosts')
        .populate('followers')
        .populate('following')
        .exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
  }

  /**
   * Trouve un utilisateur avec son username.
   *
   * @param {string} username Username de l'utilisateur
   * @returns {Promise<UserDocument | null>} Document de l'utilisateur trouvé ou `null`.
   * @throws {CustomError}
   *
   * @author Roger Montero
   */
  async findByUsername(username) {
    try {
      return await this.#model
        .findOne({ username })
        .exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
  }

  /**
   * Trouve un utilisateur avec son id.
   *
   * @param {string | mongoose.Types.ObjectId} userId Id de l'utilisateur
   * @returns {Promise<UserDocument | null>} Document de l'utilisateur trouvé ou `null`.
   * @throws {CustomError}
   *
   * @author My-Anh Chau
   */
  async findUserById(userId) {
    try {
      return this.#model
        .findById(userId)
        .exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
  }

  /**
   * Trouve un utilisateur avec son username.
   *
   * @param {string} username Username de l'utilisateur
   * @param {string} select Fields à retourner
   * @returns {Promise<UserDocument | null>} Document de l'utilisateur trouvé ou `null`.
   * @throws {CustomError}
   *
   * @author Roger Montero
   */
  async findByUsernameSelect(username, select) {
    if (!select) throw InvalidKey();
    try {
      return await this.#model
        .findOne({ username }, select)
        .exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
  }

  /**
   * Trouver les posts d'un utilisateur avec son username.
   *
   * @param {string} username Username de l'utilisateur
   * @returns {Promise<UserDocument | null>} Document de l'utilisateur trouvé ou `null`.
   * @throws {CustomError}
   *
   * @author Roger Montero
   */
  async findUserPostsByUsername(username) {
    try {
      return await this.#model
        .findOne({ username }, 'posts')
        .populate('posts')
        .exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
  }

  /**
   * Trouve les likes d'un utilisateur avec son username.
   *
   * @param {string} username Username de l'utilisateur
   * @returns {Promise<UserDocument | null>} Document de l'utilisateur trouvé ou `null`.
   * @throws {CustomError}
   *
   * @author Roger Montero
   */
  async findUserLikesByUsername(username) {
    try {
      return await this.#model
        .findOne({ username }, 'likedPosts')
        .populate('likedPosts')
        .populate('owner')
        .exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
  }

  /**
   * Trouve les followers d'un utilisateur avec son username.
   *
   * @param {string} username Username de l'utilisateur
   * @returns {Promise<UserDocument | null>} Document de l'utilisateur trouvé ou `null`.
   * @throws {CustomError}
   *
   * @author Roger Montero
   */
  async findUserFollowersByUsername(username) {
    try {
      return await this.#model
        .findOne({ username }, 'followers')
        .populate('followers')
        .exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
  }

  /**
   * Trouve les following d'un utilisateur avec son username.
   *
   * @param {string} username Username de l'utilisateur
   * @returns {Promise<UserDocument | null>} Document de l'utilisateur trouvé ou `null`.
   * @throws {CustomError}
   *
   * @author Roger Montero
   */
  async findUserFollowingByUsername(username) {
    try {
      return await this.#model
        .findOne({ username }, 'following')
        .populate('following')
        .exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
    }
  }
}

module.exports = new UserRepository();
