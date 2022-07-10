const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const User = require("./models/User");
const auth = require("./middleware/auth");
//application/x-www-form-urlencoded로 되어있는 데이터를 받겠다.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//application/json으로 되어있는 데이터를 받겠따.

app.use(cookieParser());

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
app.post("/api/users/register", (req, res) => {
  // 유저정보를 클라이언트에서 가져와서,
  // 데이터베이스에 넣자.

  //req.body는 객체형태로 데이터가 들어있음.
  const user = new User(req.body);

  //회원정보를 몽고디비에 저장한다.
  user.save((err, user) => {
    if (err) return res.send({ success: false });
    return res.status(200).send({ success: true });
  });
});

//로그인 API
app.post("/api/users/login", (req, res) => {
  //1. 요청된 이메일이 데이터베이스에 있는지 확인
  //2. 이메일이 매칭된다면, 비밀번호도 매칭되는지 확인한다.
  //3. 비밀=번호까지 맞다면 토큰을 생성한다.

  const { email, password } = req.body;
  User.findOne(
    {
      email,
    },
    (err, user) => {
      if (!user) {
        //이메일과 매칭되는 유저가 없을떄
        return res.send({
          loginSuccess: false,
          message: "이메일 주소가 잘못되었습니다.",
        });
      }

      //메서드를 자체 제각하는겨
      user.comparePassword(password, (err, isMatch) => {
        if (!isMatch) {
          return res.send({
            loginSuccess: false,
            message: "비밀번호가 잘못되었습니다.",
          });
        }

        // 요것도 이제 사용자 정의 메서드
        //토큰을 생성함.
        //데이터베이스에 토큰 저장.
        user.generateToken((err, user) => {
          if (err) return res.status(400).send(err);

          //토큰을 저장해야한다. 어디에? 쿠키? 어디?
          //쿠키에 저장하겠따.
          res.cookie("x_auth", user.token).status(200).send({
            loginSuccess: true,
            userId: user._id,
          });
        });
      });
    }
  );
});

//인증 API
app.get("/api/users/auth", auth, (req, res) => {
  //여기가 실행된다면 인증에 성공했다는 말임.

  res.status(200).send({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

//로그아웃 API
app.get("/api/users/logout", auth, (req, res) => {
  //토큰으로 로그인 유무를 확인할 수 있다.
  User.findOneAndUpdate(
    {
      _id: req.user._id,
    },
    { token: "" },
    (err, user) => {
      if (err) return res.send({ success: false, err });
      return res.status(200).send({ success: true });
    }
  );
});
// 8080포트에서 서버 프로그램을 실행하자.
app.listen(port, () => {
  console.log("서버 실행중..");
});
