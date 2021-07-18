const jwt = require('jsonwebtoken');
//require('dotenv').config();
const JWT_SECRET="MY_TOKEN_IS_SECRET";

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token,JWT_SECRET);
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};