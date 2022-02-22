module.exports = (err, req, res, next) => {
  console.error('Error Handling Middleware called');
  console.error('Path: ', req.path);
  console.error('Error: ', err);

  switch (err.name) {
    case 'ValidationError':
      res.status(400)
        .send(err.errors);
      break;
    case 'CustomError':
      res.status(err.statusCode)
        .send(err.error);
      break;
    default:
      res.status(500).send(err);
  }
};
