const jwt = require('jsonwebtoken');
const config = require('config');

const auth = async (req, res, next) => {
  //verify the token
  try {
    //get token from header
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, config.get('jwtwebtoken'));
    // console.log(decoded);
    //return;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;
