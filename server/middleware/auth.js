const User = require("../models/User");
const auth = (req, res, next) => {
  //인증처리 과정 수행.

  //클라이언트 쿠키에서 토큰을 가져오자.
  const token = req.cookies.x_auth;

  //토큰을 디코딩한후 유저를 찾는다
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.send({ isAuth: false, error: true });

    req.token = token;
    req.user = user;

    next();
  });
  //유저가 있으면 인증 성공

  //유저가 없으면 인증 실패.
};

module.exports = auth;
