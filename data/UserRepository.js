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
   * @param {mongoose.PaginateOptions} options Options de la pagination
   * @returns {Promise<UserPaginatedResult>} Liste de tous les utilisateurs
   *
   * @author Roger Montero
   */
  async getAll({ offset, page = 1 }) {
    const o = {
      ...options,
    };
    if (!offset) o.page = page;
    else o.offset = offset;
    o.populate = { path: 'posts' }

    try {
      const u = await this.#model.paginate({}, o);
      return u;
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
    // userid celui qui like
    // postid post qui est like
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
    // userId = userLiker
    // postId = postId du owner
    if (!userid || !postid) throw new Error('Id cannot be null');
    // objet d'un utilisateur qui a post
    const userLiker = await this.#model.findById(userid).exec();
    // apelle de la fonct bd pr ajouter
    if (!userLiker) throw EntityNotFound();
    try {
      // il faut trouver le id du owner

      // userLiker.likedPosts.findByIdAndDelete(new mongoose.Types.ObjectId(postid));
      userLiker.update(
        { $pull: { likedPosts: new mongoose.Types.ObjectId(userid) } },
      );
      userLiker.save();
    } catch (err) {
      debug(err);
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

  // find /user/:username/posts
  // find /user/:username/likes
  // find /user/:username/followers
  // find /user/:username/following
}

module.exports = new UserRepository();
