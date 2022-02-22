/* eslint-disable no-underscore-dangle */
const debug = require('debug')('backend:database');
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

  // mettre dans post les informations de un post specifique avec le id
  // AJOUTER PAR MYANH
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
