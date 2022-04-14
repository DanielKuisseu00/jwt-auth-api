const router = require("express").Router();
const jwt = require("jsonwebtoken");
const data = require("../data/data");
const verify = require("./verify");

const genAccessToken = (user) => {
  return (accessToken = jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.JWT_KEY,
    { expiresIn: "6s" }
  ));
};

const genRefreshToken = (user) => {
  return (accessToken = jwt.sign(
    { id: user.id, isAdmin: user.isAdmin },
    process.env.JWT_KEY,
    { expiresIn: "6s" }
  ));
};

let refreshTokens = [];

router.post("/login", (req, res) => {
  // destreuctor username and password
  const { username, password } = req.body;

  // searching data array for username and password matching json req
  const user = data.find((user) => {
    return user.username === username && user.password === password;
  });

  if (user) {
    const accessToken = genAccessToken(user);

    const refreshToken = genRefreshToken(user);

    refreshTokens.push(refreshToken);

    res.status(200).json({ user, accessToken, refreshToken });
  } else {
    res.status(500).json("username or password incorect");
  }
});

router.post("/refresh", (req, res) => {
  // GET THE REFRSH TOKEN FROM CLIENT
  const refreshToken = req.body.token;

  // VALIDATE TOKEN
  if (!refreshToken)
    return res.status(403).json("missing token or token invalid");
  
  if (!refreshTokens.includes(refreshToken))
    return res.status(401).json("Invalid refresh token");

  // SEND NEW TOKENS BACK TO CLIENT AND DELETE THE OLD TOKEN
  jwt.verify(refreshToken, process.env.JWT_KEY, (err, user) => {
    if (err) return res.status(401).json("refesh token no valid");

    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = genAccessToken(user);
    const newRefreshToken = genRefreshToken(user);
    refreshTokens.push(newRefreshToken);

    res.status(200).json({
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  });
});

router.post("/logout", verify, (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) return res.status(500).json("token invalid");

  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

  res.status(200).json("logged out successfully");
});

router.delete("/delete/:userID", verify, (req, res) => {
  if (
    req.user.id.toString() === req.params.userID.toString() ||
    req.user.isAdmin
  ) {
    res.status(200).json("deleted");
  } else {
    res.status(500).json("You're not allowed to do that!");
  }
});

module.exports = router;
