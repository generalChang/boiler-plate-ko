const mongoose = require("mongoose");

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

//스키마를 이용하여 모델을 만든다. 테이블을 만드는 개념인거같다.
const User = mongoose.model("User", userSchema);

module.exports = User;
