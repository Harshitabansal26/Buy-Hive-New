// Login.js
const express = require("express");
const jwt = require("jsonwebtoken");
const { Users } = require("./UserSchema");

const router = express.Router();

router.post('/login', async (req, res) => {
  console.log("Login");
  let success = false;
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    const passCompare = req.body.password === user.password;
    if (passCompare) {
      const data = { user: { id: user.id } };
      success = true;
      const token = jwt.sign(data, 'secret_ecom');
      res.json({ success, token });
    } else {
      return res.status(400).json({ success, errors: "Please try with correct email/password" });
    }
  } else {
    return res.status(400).json({ success, errors: "Please try with correct email/password" });
  }
});

module.exports = router;
    