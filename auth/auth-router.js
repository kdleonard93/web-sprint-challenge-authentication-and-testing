const router = require('express').Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

router.post('/register', (req, res) => {
  try {
    const { username, password } = req.body;

    const rounds = process.env.HASH_ROUNDS || 6;
    const hash = bcrypt.hashSync(password, rounds);

    const user = await db.add({ username, password: hash });
    const token = createToken(user);

    res.status(201).json({ message: "successfully registered", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error occured" });
  }
});

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const [user] = await db.findBy({ username });

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = createToken(user);

      res.status(201).json({ message: "successfully logged in", token });
    } else {
      res.status(401).json({ message: "incorrect credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function createToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
    role: user.role,
  };
  const options = {
    expiresIn: "4h",
  };

  return jwt.sign(payload, jwtSecret, options);
}

module.exports = router;
