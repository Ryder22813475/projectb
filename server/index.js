const path = require("path");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config(); // 載入 .env 檔案中的 DB_URI

const authRoute = require("./routes").auth;
const courseRoute = require("./routes").course;
const passport = require("passport");
require("./config/passport")(passport);
const cors = require("cors");
const bodyParser = require('body-parser');

// Middlewares
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // 啟用 CORS


if (process.env.NODE_ENV === "production") {
    // 讓 Express 處理靜態檔案
    // **注意路徑：** 必須是相對於 server.js 檔案的路徑
    app.use(express.static(path.join(__dirname, "..", "client", "build"))); 

    // 處理所有其他 GET 請求，並將它們轉發給 React 的 index.html
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
    });
}

// 連結MongoDB Atlas
// 🚨 關鍵修改 1: 從環境變數 (DB_URI) 讀取連線字串
mongoose
  .connect(process.env.DB_URI) 
  .then(() => {
    console.log("連結到MongoDB Atlas...");
  })
  .catch((e) => {
    console.error("MongoDB 連線失敗:", e); // 更改為 console.error 方便除錯
  });

// 路由
app.use("/api/user", authRoute);

// 受 JWT 保護的路由
// 如果 request header 內部沒有 jwt，則 request 就會被視為是 unauthorized
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);

// 伺服器啟動
// 🚨 關鍵修改 2: 使用 process.env.PORT 端口 (適用於 Render/Heroku)
const port = process.env.PORT || 8080; // 使用 Render 提供的 PORT，否則使用 8080
app.listen(port, () => {
    console.log(`伺服器正在 port ${port} 上運行...`);
    console.log(`正在生產環境？ ${process.env.NODE_ENV === 'production'}`);
});