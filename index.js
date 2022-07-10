const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const User = require("./models/User");

//application/x-www-form-urlencoded로 되어있는 데이터를 받겠다.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//application/json으로 되어있는 데이터를 받겠따.

const config = require("./config/key");

mongoose
  .connect(config.mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDb connected!!");
  })
  .catch((err) => {
    console.log(err);
  });

const port = 8080;

app.get("/", (req, res) => {
  res.send("hello world");
});

// 회원가입 API
app.post("/register", (req, res) => {
  // 유저정보를 클라이언트에서 가져와서,
  // 데이터베이스에 넣자.

  //req.body는 객체형태로 데이터가 들어있음.
  const user = new User(req.body);

  //회원정보를 몽고디비에 저장한다.
  user.save((err, userInfo) => {
    if (err) return res.send({ success: false });
    return res.status(200).send({ success: true });
  });
});
// 8080포트에서 서버 프로그램을 실행하자.
app.listen(port, () => {
  console.log("서버 실행중..");
});
