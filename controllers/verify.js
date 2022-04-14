const jwt = require("jsonwebtoken");

const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
      if (err) {
        res.status(403).json("token is invalid");
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    res.status(500).json("You're not authenticated");
  }
};

module.exports = verify;
