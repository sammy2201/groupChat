
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");




const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');




app.use(session({
  secret: 'Our secret',
  resave: false,
  saveUninitialized: false,
}));


app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/chatdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const chatSchema = new mongoose.Schema({
  chat: String,
  name: {
     type: String,
     unique: false
 },

});



const userSchema = new mongoose.Schema({
  email: String,
  name: String,
  password: String
});


userSchema.plugin(passportLocalMongoose);

const ChatItem = mongoose.model("chatItem", chatSchema);
const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});


app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});




app.get("/chat", function(req, res) {
  if (req.isAuthenticated()) {

    ChatItem.find(function(err, founditems) {

      res.render("chat", {
        nameUser:founditems,
        newChat: founditems
        });
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});


app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/chat");
      });
    }
  });
});


app.post("/register", function(req, res) {
  const nameOfUser = req.body.name;

  User.register({
    username: req.body.username,
    name: nameOfUser
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/chat");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/chat");
      });
    }
  });
});



app.post("/chat", function(req, res) {
  const chat = req.body.chat;
  const nameOfUser = req.user.name;
  const someconstant = new ChatItem({
    chat: chat,
    name:nameOfUser
  });

  someconstant.save();


  res.redirect("/chat");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("in port 3000");
});
