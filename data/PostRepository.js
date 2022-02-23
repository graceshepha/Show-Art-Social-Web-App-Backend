/* eslint-disable no-underscore-dangle */
const debug = require('debug')('backend:database');
const mongoose = require('mongoose');
const client = require('../utils/database');
const { DuplicatedUniqueError, UnknownError } = require('../utils/errors');
const userRepository = require('./UserRepository');

/** @type {import('mongoose').PaginateOptions} */
const options = {
  lean: true,
  limit: 5,
  sort: { date: -1 },
};

class PostRepository {
  #model;

  /** @constructor */
  constructor() {
    this.#model = client.getPostModel();
  }

  /*
  *
  * @author My-Anh Chau
  *
  */
  async insertOne(info) {
    const post = new this.#model(info);
    // VALIDATE
    try {
      await this.#model.validate(post);
      // MUST INSERT POST TO USER ARRAY !!
      userRepository.insertPost(post.owner, post._id);
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
        throw DuplicatedUniqueError(`Posts cannot share the same ${arr.join(', ')}`);
      } else {
        // UNKNOWN ERROR
        debug(err);
        throw UnknownError();
      }
    }
  }

  // PostRepo: addLike(userid) / removeLike(userid)
  // userid = celui qui a like

  async addLike(userid) {
    try {
      // Inserer un like
      const post = await this.#model.findById(userid).exec();
      // insert user to the like array qui sapelle likedPosts
      userRepository.addLikedPost(post);
      // fo ajouter lutilisateur qui a le like et celui qui like
      this.#model.likes.push(new mongoose.Types.ObjectId(userid));
      this.#model.save();
    } catch (err) {
      throw UnknownError();
    }
  }

  async removeLike(userid) {
    try {
      // prendre obj du post de lutilisateur
      const post = await this.#model.findById(userid).exec();
      // remove user to the like array qui sapelle likedPosts
      this.#model.likes.splice(new mongoose.Types.ObjectId(userid));
      this.#model.save();
      userRepository.removeLikedPost(post);
    } catch (err) {
      throw UnknownError();
    }
  }

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
