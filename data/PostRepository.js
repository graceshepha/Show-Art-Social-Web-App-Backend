const debug = require('debug')('backend:postRepository');
const mongoose = require('mongoose');
const client = require('../utils/database');
const {
  DuplicatedUnique, UnknownError, InvalidKey, EntityNotFound,
} = require('../utils/errors');
const userRepository = require('./UserRepository');
/**
 * @typedef {import('../types/schemas.types').Post} Post
 * @typedef {mongoose.HydratedDocument<Post>} PostDocument
 * @typedef {mongoose.PaginateDocument<Post, {}>} PostPaginatedDocument
 * @typedef {mongoose.PaginateResult<PostPaginatedDocument>} PostPaginatedResult
 */

/**
 * @ignore
 * @type {mongoose.PaginateOptions}
 */
const options = {
  lean: true,
  limit: 10,
  sort: { date: -1 },
};

/**
 * Dépot d'un post qui possède tous les fonctions CRUD
 * d'un post dans l'application.
 */
class PostRepository {
  #model;

  /** @constructor */
  constructor() {
    this.#model = client.getPostModel();
  }

  /**
   * @param {Post} info Informations initiales du post a insérer
   * @returns {Promise<PostDocument>}
   *
   * @author My-Anh Chau
   * @author Bly Grâce Schephatia
   */
  async insertOne(info) {
    /** @type {PostDocument} */
    const post = new this.#model(info);
    // VALIDATE
    try {
      await post.validate();
      userRepository.insertPost(post.owner, post._id); // MUST INSERT POST TO USER ARRAY !!
      return await post.save();
    } catch (err) {
      if (err.name === 'ValidationError') {
        debug(err);
        throw err;
      } else if (err.code === 11000) {
        // DUPLICATED
        debug(err);
        const keys = Object.keys(err.keyValue);
        const arr = keys.map((k) => `${k} (${err.keyValue[k]})`);
        throw DuplicatedUnique(`Posts cannot share the same ${arr.join(', ')}`);
      } else {
        // UNKNOWN ERROR
        debug(err);
        throw UnknownError();
      }
    }
  }

  /**
   * @author My-Anh Chau
   */
  async addLike(userid, postid) {
    if (!userid || !postid) throw InvalidKey('Id cannot be null');
    try {
      const post = await this.#model.findByIdAndUpdate(
        postid,
        { $push: { 'meta.likes': new mongoose.Types.ObjectId(userid) } },
        { new: true },
      );
      if (!post) throw EntityNotFound();
      userRepository.addLikedPost(userid, postid);
    } catch (err) {
      if (err.name === 'CustomError') { throw err; }
      throw UnknownError();
    }
  }

  /**
   * @author My-Anh Chau
   */
  async removeLike(userid, postid) {
    if (!userid || !postid) throw InvalidKey('Id cannot be null');
    try {
      const post = await this.#model.findByIdAndUpdate(
        postid,
        { $pull: { 'meta.likes': new mongoose.Types.ObjectId(userid) } },
        { new: true },
      );
      if (!post) throw EntityNotFound();
      userRepository.removeLikedPost(userid, postid);
    } catch (err) {
      if (err.name === 'CustomError') { throw err; }
      throw UnknownError();
    }
  }

  /**
   * @param {string | mongoose.Types.ObjectId} id Id du post à chercher
   * @returns {Promise<PostDocument>} Document du post
   *
   * @author My-Anh Chau
   */
  async findPostById(id) {
    // mettre dans post les informations de un post specifique avec le id
    // faire un trycatch avec un string qui doit etre sup a 24
    // catch les erreurs possibles
    try {
      return await this.#model.findById(id)
        .populate({ path: 'owner' })
        .populate({ path: 'comments.user', select: 'id username picture' })
        .exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
      // raison qui peut avoir une erreur
      // que sa soit pas assez de string
    }
  }

  /**
   * @ignore
   * @author My-Anh Chau
   */
  async findByIdDel(id) {
    try {
      // whats the difference between findByIdAndDelete or findByIdAndRemove
      return await this.#model.findByIdAndDelete(id).exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
      // raison qui peut avoir une erreur
      // que sa soit pas assez de string
    }
  }

  /**
   * @param {string} search Filtre (by title)
   * @param {mongoose.PaginateOptions} options
   * @returns {Promise<PostPaginatedResult>} Documents des posts paginés
   *
   * @author Bly Grâce Schephatia
   */
  async getAll(search, { select, page = 1 }) {
    const o = {
      ...options,
      page,
      select,
    };
    o.populate = { path: 'owner' };

    const searchFilter = search ? { title: { $regex: new RegExp(search, 'i') } } : {};

    try {
      return await this.#model.paginate(searchFilter, o);
    } catch (err) {
      debug(err);
      throw UnknownError();
    }
  }

  /**
   * Ajoute une view à un post
   *
   * @param {string} id Id du post
   * @author Roger Montero
   */
  async addView(id) {
    try {
      const post = await this.#model.findByIdAndUpdate(
        id,
        { $inc: { 'meta.views': 1 } },
      );
      if (!post) throw EntityNotFound();
    } catch (err) {
      debug(err);
      if (err.name === 'CustomError') throw err;
      throw InvalidKey();
    }
  }

  /**
   * Ajoute un commentaire à un post
   *
   * @param {string} id Id du post
   * @param {{user: string, comment: string}} comment Commentaire a insérer
   * @returns {Promise<PostDocument>} Document du post commentée
   *
   * @author Roger Montero
   */
  async addComment(id, comment) {
    if (!comment && !comment.id && !comment.user) throw InvalidKey();
    try {
      const post = await this.#model.findByIdAndUpdate(
        id,
        { $push: { comments: comment } },
        { new: true, populate: { path: 'comments.user', select: 'id username picture' } },
      );
      if (!post) throw EntityNotFound();
      return post;
    } catch (err) {
      debug(err);
      if (err.name === 'CustomError') throw err;
      throw InvalidKey();
    }
  }
}
module.exports = new PostRepository();
