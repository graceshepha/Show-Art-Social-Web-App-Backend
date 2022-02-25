/* eslint-disable no-underscore-dangle */
const debug = require('debug')('backend:database');
const mongoose = require('mongoose');
const client = require('../utils/database');
const {
  DuplicatedUnique, UnknownError, InvalidKey, EntityNotFound,
} = require('../utils/errors');
const userRepository = require('./UserRepository');

/** @type {import('mongoose').PaginateOptions} */
const options = {
  lean: true,
  limit: 1,
  sort: { date: -1 },
};

class PostRepository {
  #model;

  /** @constructor */
  constructor() {
    this.#model = client.getPostModel();
  }

  /**
   * @author My-Anh Chau
   * @author Bly Grâce Schephatia
   */
  async insertOne(info) {
    const post = new this.#model(info);
    // VALIDATE
    try {
      await this.#model.validate(post);
      // MUST INSERT POST TO USER ARRAY !!
      userRepository.insertPost(post.owner, post._id);
      console.log(post.owner);
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
      // prendre obj du post de lutilisateur
      const post = await this.#model.findUserById(postid);
      const user = await userRepository.findUserById(userid);
      // remove user to the like array qui sapelle likedPosts
      // this.#model.likes.splice(new mongoose.Types.ObjectId(userid));

      post.meta.likes.findByIdDel(new mongoose.Types.ObjectId(userid));
      user.removeLikedPost(userid, postid);
      post.save();
      user.save();
      return await user.save();
    } catch (err) {
      throw UnknownError();
    }
  }

  /**
   * @author My-Anh Chau
   */

  // mettre dans post les informations de un post specifique avec le id
  async getOne(id) {
    // faire un trycatch avec un string qui doit etre sup a 24
    // catch les erreurs possibles
    try {
    // prendre obj selon le id
      const post = await this.#model.findById(id).exec();
      return post;
    } catch (err) {
      debug(err);
      throw UnknownError();
      // raison qui peut avoir une erreur
      // que sa soit pas assez de string
    }
  }

  /**
   * @author My-Anh Chau
   */
  async findById(id) {
    // mettre dans post les informations de un post specifique avec le id
    // faire un trycatch avec un string qui doit etre sup a 24
    // catch les erreurs possibles
    try {
      const post = this.#model.findById(id);
      post.populate({ path: 'owner' });
      return await post.exec();
    } catch (err) {
      debug(err);
      throw InvalidKey(err.message);
      // raison qui peut avoir une erreur
      // que sa soit pas assez de string
    }
  }

  /**
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
}
module.exports = new PostRepository();
