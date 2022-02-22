// @ts-check
/**
 * @typedef {Object} ErrObject
 * @property {string} type
 * @property {string} message
 * @property {number} status
 */

/**
 * Fonction pour créer les erreurs avec un certain format.
 *
 * @param {string} t - Type of the error
 * @param {string} m - Message of the error
 * @param {number} s - Status code to return
 * @returns {ErrObject} Object of the error
 * @author Roger Montero
 */
function createError(t, m, s) {
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

    /**
     * @type {number}
     * @readonly
     */
    status: s,

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
  1: createError('Unknown', 'Unknown error occured in the database', 500),
  /** @readonly NotConnectedError */
  2: createError('NotConnected', 'Database is not connected', 500),
  /** @readonly DuplicatedUniqueKeyError */
  3: createError('DuplicatedUnique', 'There cannot be two documents with the same unique value', 400),
  /** @readonly EntityNotFound */
  4: createError('KeyInvalidFormat', 'Cast to type required failed for value given', 400),
  /** @readonly EntityNotFound */
  5: createError('EntityNotFound', "The object with that criteria doesn't exist in our database", 404),
};

/**
 * Classe personalisée pour certains erreurs de notre base de donnée.
 *
 * @extends Error
 * @author Roger Montero
 */
class CustomError extends Error {
  /** @type {string} */
  name = 'CustomError';

  /** @type {Date} */
  date;

  /** @type {string} */
  message;

  /** @type {number} */
  code;

  /** @type {ErrObject} */
  error;

  /**
   * @constructor
   * @param {number} [code=1] Error code
   */
  constructor(code = 1, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
    // Get values with params
    const error = errCodes[code] ? errCodes[code] : errCodes[1];
    const msg = !params[0] ? error.message : params[0];

    this.date = new Date();
    this.message = msg;
    this.code = code;
    this.statusCode = error.status;
    this.error = {
      ...error,
      message: msg,
      status: undefined,
    };
  }
}

module.exports = CustomError;
