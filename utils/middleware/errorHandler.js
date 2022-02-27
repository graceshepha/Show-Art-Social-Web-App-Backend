/**
 * Error handler de notre application express
 * @author Roger Montero
 */
module.exports = (err, req, res, next) => {
  switch (err.name) {
    case 'ValidationError':
      res.status(400)
        .json(err.errors);
      break;
    case 'CustomError':
      res.status(err.statusCode)
        .json(err.error);
      break;
    default:
      res.status(500)
        .json(err);
  }
};
