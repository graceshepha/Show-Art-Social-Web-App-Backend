// @ts-check
const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
// const uniqueValidator = require('mongoose-unique-validator');
/**
 * @typedef {import('../../types/schemas.types').User} User
 * @typedef {import('../../types/schemas.types').Post} Post
 * @typedef {import('../../types/schemas.types').Tag} Tag
 * @typedef {mongoose.PaginateModel<User, mongoose.Model<User>>} UserModel
 * @typedef {mongoose.PaginateModel<Post, mongoose.Model<Post>>} PostModel
 * @typedef {mongoose.PaginateModel<Tag, mongoose.Model<Tag>>} TagModel
 */

const { Schema } = mongoose;

/**
 * Schéma de la collection `users`.
 *
 * @type {mongoose.Schema<User, UserModel>}
 * @author Roger Montero
 */
const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: [true, 'Username is required'],
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: [true, 'Email is required'],
    immutable: true,
  },
  emailVerified: Boolean,
  picture: String,
  details: {
    bio: String,
    workplace: String,
    socials: {
      twitter: String,
      facebook: String,
      website: String,
    },
    location: {
      city: String,
      country: String,
    },
  },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  likedPosts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { id: true });
// userSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });
userSchema.plugin(paginate);
/**
 * Schéma de la collection `posts`.
 *
 * @type {mongoose.Schema<Post, PostModel>}
 * @author Roger Montero
 */
const postSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title must be given'],
    index: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Post needs an owner'],
    index: true,
    immutable: true,
  },
  image: {
    type: String,
    required: [true, 'Post needs to include an image'],
  },
  description: {
    type: String,
    default: '',
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public',
  },
  date: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: 'Tag',
    index: true,
  }],
  meta: {
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    views: {
      type: Number,
      get: (v) => Math.round(v),
      set: (v) => Math.round(v),
      default: 0,
    },
  },
  comments: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment needs to be commented by a user'],
      immutable: true,
    },
    comment: { type: String, immutable: true },
  }],
}, { id: true });
// postSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });
postSchema.plugin(paginate);
/**
 * Schéma de la collection `tags`.
 *
 * @type {mongoose.Schema<Tag, TagModel>}
 * @author Roger Montero
 */
const tagSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    unique: true,
    uniqueCaseInsensitive: true,
    required: [true, 'Tag needs a name'],
  },
  description: String,
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
}, { id: true });
// tagSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' });
tagSchema.plugin(paginate);

exports.userSchema = userSchema;
exports.postSchema = postSchema;
exports.tagSchema = tagSchema;
