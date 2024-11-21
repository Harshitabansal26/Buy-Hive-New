const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

const Login = require("./Login");
const SignUp = require("./SignUp");
const { Users } = require("./UserSchema");

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb+srv://harmeet96:U75SYB05AWP1@cluster0.0elap.mongodb.net/e-commerce");

// Middleware for file uploads
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage: storage });
app.post("/upload", upload.single('product'), (req, res) => {
  res.json({ success: 1, image_url: `/images/${req.file.filename}` });
});

// Serve static images
app.use('/images', express.static('upload/images'));

// Middleware for user authentication
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send({ errors: "Please authenticate using a valid token" });
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

// Routes
app.use("/login", Login);
app.use("/signup", SignUp);

// Cart routes
app.post('/addtocart', fetchuser, async (req, res) => {
  console.log("Add Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Added");
});

app.post('/removefromcart', fetchuser, async (req, res) => {
  console.log("Remove Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] != 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
  res.send("Removed");
});

app.post('/getcart', fetchuser, async (req, res) => {
  console.log("Get Cart");
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

// Test route
app.get("/", (req, res) => {
  res.send("Root");
});

// Start server
app.listen(port, (error) => {
  if (!error) console.log("Server running on port " + port);
  else console.log("Error:", error);
});