// @ts-check
/**
 * @typedef {Object} ErrObject
 * @property {string} type
 * @property {string} [path]
 * @property {string} message
 */

/**
 * Fonction pour créer les erreurs avec un certain format.
 *
 * @param {string} t - Type of the error
 * @param {string} m - Message of the error
 * @returns {ErrObject} Object of the error
 * @author Roger Montero
 */
function createError(t, m) {
  return {
    /**
      * @type {string}
      * @readonly
      */
    type: t,

    /**
     * @type {string}
     * @readonly
     */
    message: m,
  };
}

/**
 * Object avec les erreurs pour chaque code d'erreur.
 *
 * @type {Object<number, ErrObject>}
 * @author Roger Montero
 */
const errCodes = {
  /** @readonly UnknownError */
  1: createError('UnknownError', 'Unknown error occured in the database'),
  /** @readonly NotConnectedError */
  2: createError('NotConnectedError', 'Database is not connected'),
  /** @readonly DuplicatedUniqueKeyError */
  3: createError('DuplicatedUniqueKeyError', 'There cannot be two documents with the same unique value'),
  /** @readonly  */
  4: createError('EntityNotFound', "The object with that criteria doesn't exist in our database"),
};

/**
 * Classe personalisée pour certains erreurs de notre base de donnée.
 *
 * @extends Error
 * @author Roger Montero
 */
class DatabaseError extends Error {
  /** @type {string} */
  name = 'DatabaseError';

  /** @type {Date} */
  date;

  /** @type {string} */
  message;

  /** @type {number} */
  errCode;

  /** @type {ErrObject} */
  error;

  /**
   * @constructor
   * @param {number} [err=1] Error code
   * @param {string} [path] Path where the error occured
   */
  constructor(err = 1, path = undefined, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
    // Get values with params
    const o = errCodes[err] ? errCodes[err] : errCodes[1];
    const m = !this.message ? o.message : this.message;

    this.date = new Date();
    this.message = m;
    this.errCode = err;
    this.error = {
      type: o.type,
      path,
      message: m,
    };
  }
}

module.exports = DatabaseError;
