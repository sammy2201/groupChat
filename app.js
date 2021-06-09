//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');
mongoose.connect("mongodb://localhost:27017/chatdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const chatSchema = new mongoose.Schema({
  chat: String,
});

const ChatItem = mongoose.model("chatItem", chatSchema);

app.get("/",function(req,res){
  res.render("signin");
});


app.get("/chat", function(req, res) {
  ChatItem.find(function(err, founditems) {
    if (founditems.length === 0) {

      res.render("index", {
        newChat: " "
      });
    } else {

      res.render("index", {
        newChat: founditems
      });

    }

  });
});

app.post("/chat", function(req, res) {
  const chat = req.body.chat;

  const sam = new ChatItem({
    chat: chat
  });
  sam.save();

  res.redirect("/chat");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("in port 3000");
});
