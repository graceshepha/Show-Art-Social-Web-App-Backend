const debug = require('debug')('backend:database');
const { client, DatabaseError } = require('../utils/database');

/** @type {import('mongoose').PaginateOptions} */
const options = {
  lean: true,
  limit: 5,
};

class PostRepository {
  #model;

  /** @constructor */
  constructor() {
    this.#model = client.getPostModel();
  }

  async insertOne(info) {
    const post = new this.#model(info);
    // MUST INSERT POST TO USER ARRAY !!
    // VALIDATE
    try {
      await this.#model.validate(post);
      return await post.save();
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
          `Two post cannot share the same ${key} (${err.keyValue[key]})`,
        );
      } else {
        // UNKNOWN ERROR
        debug(err);
        throw new DatabaseError();
      }
    }
  }

  async getAll({ offset, page = 1 }) {
    const o = { ...options };
    if (!offset) o.page = page;
    else o.offset = offset;
    o.populate = { path: 'owner', select: 'id username' };

    try {
      return await this.#model.paginate({}, o);
    } catch (err) {
      debug(err);
      throw new DatabaseError();
    }
  }
}

module.exports = new PostRepository();
