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

  // PostRepo: addLike(userid) / removeLike(userid)
  // userid = celui qui a like

  /**
   * @author My-Anh Chau
   */
  async addLike(userid, postid) {
    try {
      // AVEC LE POST REPOSITORY
      //
      // postid de la photo qui est like
      // userId de l'utilisateur qui a like la photo
      //
      // retourne lobj du user qui a like

      // retourne lobjet du post qui a ete like
      const post = await this.#model.findById(postid);
      if (!post) throw EntityNotFound();
      // const user = await userRepository.findUserById(userid);
      // insert user to the like array qui sapelle likedPosts
      // inserer le userId dans le array de post qui a ete like
      //
      // inserer le userId dans le array likes
      post.meta.likes.push(new mongoose.Types.ObjectId(userid));
      await userRepository.addLikedPost(userid, postid);
      await post.save();
    } catch (err) {
      throw UnknownError();
    }
  }

  /**
   * @author My-Anh Chau
   */
  async removeLike(userid, postid) {
    try {
    // userId = userLiker
    // postId = postId du owner
      // prendre obj du post de lutilisateur
      const post = await this.#model.findById(postid);
      const user = await userRepository.findUserById(userid);
      if (!post || !user) throw EntityNotFound();
      // remove user to the like array qui sapelle likedPosts
      // this.#model.likes.splice(new mongoose.Types.ObjectId(userid));
      // Faire quelque chose de similaire
      // post.meta.likes.findByIdDel(new mongoose.Types.ObjectId(userid));
      // { $push: { <post.meta.likes>: <value1>, ... } }
      // Remove object by id from an array in mongoose ( enlever le like du liker)
      post.update(
        { $pull: { 'post.meta.likes': new mongoose.Types.ObjectId(postid) } },
      );
      // la il faut trouver le userid tu userOwner
      // const email = PostRepository.req.auth.payload['http:localhost//email'];
      // userId = userLiker
      // postId = postId du owner
      debug(post.meta.likes);
      debug(new mongoose.Types.ObjectId(postid));
      userRepository.removeLikedPost(userid, postid);
      post.save();
      return await user.save();
    } catch (err) {
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
   * @param {mongoose.PaginateOptions} options
   * @returns {Promise<PostPaginatedResult>} Documents des posts paginés
   *
   * @author Bly Grâce Schephatia
   */
  async getAll({ offset, page = 1 }) {
    const o = { ...options };
    if (!offset) o.page = page;
    else o.offset = offset;
    o.populate = { path: 'owner' };

    try {
      return await this.#model.paginate({}, o);
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
