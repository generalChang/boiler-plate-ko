const express = require("express");
const app = express();
const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://rhdrnsckdgh0921:abcd1234@bolierplate.hdny4ap.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
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

// 8080포트에서 서버 프로그램을 실행하자.
app.listen(port, () => {
  console.log("서버 실행중..");
});
