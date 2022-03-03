const CustomError = require('./basecustomerror');

/**
 * Erreur lorsqu'on n'a pas pu identifier le type, ça renvois erreur 500
 *
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.UnknownError = (message, ...params) => new CustomError(1, message, ...params);

/**
 * Erreur lorsque le client n'est pas connecté, ça renvois erreur 500
 *
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.NotConnected = (message, ...params) => new CustomError(2, message, ...params);

/**
 * Erreur lorsqu'il a des valeurs dupliqués, ça renvois erreur 400
 *
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.DuplicatedUnique = (message, ...params) => new CustomError(3, message, ...params);

/**
 * Erreur lorsque le id n'est pas le bon format, ça renvois erreur 400
 *
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.InvalidKey = (message, ...params) => new CustomError(4, message, ...params);

/**
 * Erreur lorsqu'on a pas trouvé le document avec le id donnée, ça renvois erreur 404
 *
 * @param {string} [message] Message de l'erreur
 * @author Roger Montero
 */
exports.EntityNotFound = (message, ...params) => new CustomError(5, message, ...params);
