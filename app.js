//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
require('dotenv/config');



const app = express();
app.use(express.static(__dirname + "/public"));
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now());
  }
});

var upload = multer({
  storage: storage
});

/////////////////////////////////////////schema////////////////////////

const chatSchema = new mongoose.Schema({
  chat: String,
  name: {
    type: String,
    unique: true,
  },
  time: String,
  img: {
    data: Buffer,
    contentType: String
  },
  image: String

});

const groupSchema = new mongoose.Schema({
  nameOfGroup: String,
  chat: String,
  name: {
    type: String,
    unique: false,
  },
  time: String,
  img: {
    data: Buffer,
    contentType: String
  },
  image: String

});

const userSchema = new mongoose.Schema({
  email: String,
  name: {
    type: String,
    unique: true,
  },
  password: String,

});



//////////////////////////////////////////////////////////////////
userSchema.plugin(passportLocalMongoose);

//////////////////////////model//////////////////////////////////

const ChatItem = mongoose.model("chatItem", chatSchema);
const User = new mongoose.model("User", userSchema);
const Group = new mongoose.model("Group", groupSchema);
// var imgModel= new mongoose.model('Image', imageSchema);
////////////////////////////////////////////////////////////////



/////////////////////passport//////////////////////////////////
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
///////////////////////////get////////////////////////////////////

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
        groupname: "Boom",
        newChat: founditems,
        username: req.user.name,
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
app.get("/:customGroupName", function(req, res) {
  const costumGroupName = req.params.customGroupName;
  if (req.isAuthenticated()) {
    Group.find(function(err, founditems) {
      res.render("chat", {
        groupname: costumGroupName,
        newChat: founditems,
        username: req.user.name,
      });
    });
  } else {
    res.redirect("/login");
  }
});







////////////////////////post///////////////////
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
      res.send("<h3>username or mail already exist </h3><br></h4>please try with other credentials</h4>");
      res.redirect("/chat");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/chat");
      });
    }
  });
});


app.post("/delete", function(req, res) {
  const deleteItemId = req.body.deletebutton;
  ChatItem.findByIdAndRemove(deleteItemId, function(err) {
    if (!err) {
      res.redirect("/chat");
    }
  });
});


app.post("/chat", upload.single('image'), function(req, res) {

  const chat = req.body.chat;
  const fromThisPage = req.body.button;
  const nameOfUser = req.user.name;
  const date_ob = new Date();
  const hours = date_ob.getHours();
  const minutes = date_ob.getMinutes();
  const currentTime = hours + ":" + minutes;

  if (fromThisPage === "Boom") {
    if (chat !== undefined) {
      const someconstant = new ChatItem({
        chat: chat,
        name: nameOfUser,
        time: currentTime,
        image: false,
      });
      someconstant.save();
    }
    if (chat === undefined) {
      const someconstant = new ChatItem({

        name: nameOfUser,
        time: currentTime,
        img: {
          data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
          contentType: 'image/png'
        },
        image: true,

      });
      someconstant.save();
    }

    res.redirect("/chat");
  } else {
    if (chat !== undefined) {

      const someconstant = new Group({
        nameOfGroup: fromThisPage,
        chat: chat,
        name: nameOfUser,
        time: currentTime,
        image: false,
      });
      someconstant.save();
    }
    if (chat === undefined) {
      const someconstant = new Group({
        nameOfGroup: fromThisPage,
        name: nameOfUser,
        time: currentTime,
        img: {
          data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
          contentType: 'image/png'
        },
        image: true,

      });
      someconstant.save();
    }

    res.redirect("/"+fromThisPage);

  }


});





app.listen(process.env.PORT || 3000, function() {
  console.log("in port 3000");
});
