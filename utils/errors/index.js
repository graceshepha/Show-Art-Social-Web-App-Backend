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
exports.NotConnectedError = (message, ...params) => new CustomError(2, message, ...params);

/**
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.DuplicatedUniqueError = (message, ...params) => new CustomError(3, message, ...params);

/**
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.EntityNotFound = (message, ...params) => new CustomError(4, message, ...params);
