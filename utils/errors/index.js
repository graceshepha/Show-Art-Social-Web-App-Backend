const CustomError = require('./basecustomerror');

/**
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.UnknownError = (message, ...params) => new CustomError(1, message, ...params);

/**
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.NotConnected = (message, ...params) => new CustomError(2, message, ...params);

/**
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.DuplicatedUnique = (message, ...params) => new CustomError(3, message, ...params);

/**
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.InvalidKey = (message, ...params) => new CustomError(4, message, ...params);

/**
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.EntityNotFound = (message, ...params) => new CustomError(5, message, ...params);
