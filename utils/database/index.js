// @ts-check
const DatabaseClient = require('./Database');
const DatabaseError = require('./DatabaseError');

exports.client = new DatabaseClient();
exports.DatabaseError = DatabaseError;
