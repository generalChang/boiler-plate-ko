const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); //암호화 모듈 불러오기.
const { urlencoded } = require("body-parser");
const jwt = require("jsonwebtoken");
const saltRounds = 10;
// 스키마를 생성하자.
const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, // 공백을 없애주는 역할
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number, // 유저별 신분 식별 용도.
    default: 0, //기본값은 0
  },
  image: {
    type: String,
  },
  token: {
    type: String,
  },
  tokenExp: {
    type: Number, //유효기간
  },
});

userSchema.pre("save", function (next) {
  //save메서드 실행되기 전에 실행되는 영역.
  //비밀번호를 암호화 시킬거임.
  var user = this;

  //비밀번호를 바꿀때만 암호화 하겠따.
  if (user.isModified("password")) {
    // getSalt = 솔트를 생성함.
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        // Store hash in your password DB.
        //hash값이 암호화된 비밀번호임.
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

//인스턴스에 사용자 정의 메소드를 추가해주자.
userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
    if (err) return cb(err);
    cb(null, isMatch); //isMatch안에 트루가 자동으로 들어감.
  });
};

userSchema.methods.generateToken = function (cb) {
  //jsonwebtoken을 이용하여 토큰을 생성한다.
  //토큰은 유저를 식별할떄 쓴다.
  const user = this;
  const token = jwt.sign(user._id.toHexString(), "secretToken");
  user.token = token;
  user.save((err, user) => {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  const user = this;

  jwt.verify(token, "secretToken", function (err, decoded) {
    //유저 아이디를 이용해서 유저를 찾은다음
    //클라이언트에서 가져온 token과 데이터베이스의 보관된 토큰이 일치하는지 확인.
    user.findOne(
      {
        _id: decoded,
        token: token,
      },
      (err, user) => {
        if (err) return cb(err);
        return cb(null, user);
      }
    );
  });
};
//스키마를 이용하여 모델을 만든다.
//이 객체를 이용하여 실제로 데이터베이스에 작업을 할수 있는거임.
const User = mongoose.model("User", userSchema);

module.exports = User;
