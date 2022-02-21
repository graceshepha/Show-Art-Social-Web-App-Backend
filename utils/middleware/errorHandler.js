module.exports = (err, req, res, next) => {
  console.error('Error Handling Middleware called');
  console.error('Path: ', req.path);
  console.error('Error: ', err);

  // temp
  if (err.name === 'ValidationError') {
    res.status(400)
      .send(err);
  } else if (err.name === 'CustomError') {
    if (err.code === 3) {
      res.status(400)
        .send(err);
    } else if (err.code === 4) {
      res.status(404)
        .send(err);
    } else if (err.code in [1, 2]) {
      res.status(400)
        .send(err);
    }
  } else {
    res.status(500)
      .send(err);
  }
};
