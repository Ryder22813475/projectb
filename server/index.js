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

// ----------------------------------------
// 1. 中間件配置
// ----------------------------------------
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 僅在開發環境中啟用 CORS，生產環境中由 Express 靜態服務取代
// 避免在 Render 部署時產生不必要的 CORS 錯誤
if (process.env.NODE_ENV !== "production") {
    app.use(cors()); 
}


// ----------------------------------------
// 2. API 路由 (必須在靜態檔案服務之前)
// ----------------------------------------

// 公開路由
app.use("/api/user", authRoute);

// 受 JWT 保護的路由
// 如果 request header 內部沒有 jwt，則 request 就會被視為是 unauthorized
app.use(
  "/api/courses",
  passport.authenticate("jwt", { session: false }),
  courseRoute
);


// ----------------------------------------
// 3. 生產環境靜態檔案服務和通配符路由 (僅在生產環境中運行)
// ----------------------------------------
if (process.env.NODE_ENV === "production") {
    
    // 讓 Express 處理靜態檔案 (client/build)
    // **注意路徑：** 必須是相對於 server.js 檔案的路徑
    app.use(express.static(path.join(__dirname, "..", "client", "build"))); 

    // 處理所有其他 GET 請求 (非 /api 路徑)，並將它們轉發給 React 的 index.html
    // 這個 app.get("*") 放在 API 路由之後，只處理 React Router 的前端路徑
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
    });
}


// ----------------------------------------
// 4. 資料庫連線
// ----------------------------------------
mongoose
  .connect(process.env.DB_URI) 
  .then(() => {
    console.log("連結到MongoDB Atlas...");
  })
  .catch((e) => {
    console.error("MongoDB 連線失敗:", e);
  });


// ----------------------------------------
// 5. 伺服器啟動
// ----------------------------------------
// 使用 Render 提供的 PORT (process.env.PORT)，否則使用 8080
const port = process.env.PORT || 8080; 
app.listen(port, () => {
    console.log(`伺服器正在 port ${port} 上運行...`);
    console.log(`正在生產環境？ ${process.env.NODE_ENV === 'production'}`);
});