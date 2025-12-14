const router = require("express").Router();
const Course = require("../models").course;
const courseValidation = require("../validation").courseValidation;
// ⚠️ 移除：const fs = require("fs"); 

router.use((req, res, next) => {
  console.log("course route正在接受一個request...");
  next();
});

// 獲得系統中的所有課程
router.get("/", async (req, res) => {
  try {
    let courseFound = await Course.find({})
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    // 修正錯誤狀態碼
    return res.status(500).send(e); 
  }
});

// 用講師id來尋找課程
router.get("/instructor/:_instructor_id", async (req, res) => {
  let { _instructor_id } = req.params;
  try {
    let coursesFound = await Course.find({ instructor: _instructor_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFound);
  } catch (e) {
    return res.status(500).send(e); 
  }
});

// 用學生id來尋找註冊過的課程
router.get("/student/:_student_id", async (req, res) => {
  let { _student_id } = req.params;
  try {
    let coursesFound = await Course.find({ students: _student_id })
      .populate("instructor", ["username", "email"])
      .exec();
    return res.send(coursesFound);
  } catch (e) {
    return res.status(500).send(e); 
  }
});

// 用課程名稱尋找課程
router.get("/findByName/:name", async (req, res) => {
  let { name } = req.params;
  try {
    let courseFound = await Course.find({ title: name })
      .populate("instructor", ["email", "username"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// 用課程id尋找課程
router.get("/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let courseFound = await Course.findOne({ _id })
      .populate("instructor", ["email"])
      .exec();
    return res.send(courseFound);
  } catch (e) {
    return res.status(500).send(e);
  }
});

// ⚠️ 移除 saveImage 函數

// 新增課程 (修正邏輯)
router.post("/", async (req, res) => {
  try {
    const { error } = courseValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (req.user.isStudent()) {
      return res
        .status(400)
        .send("只有講師才能發佈新課程。若你已經是講師，請透過講師帳號登入。");
    }

    const { title, description, price, base64String } = req.body;
    // ⚠️ 移除檔案儲存和硬編碼 URL 邏輯
    
    const newCourse = new Course({
      title,
      description,
      price,
      // ✅ 核心修正：直接將 Base64 字串存入資料庫，供前端直接渲染
      base64String: base64String, 
      instructor: req.user._id,
    });

    const savedCourse = await newCourse.save();
    return res.send("新課程已經保存");
  } catch (e) {
    console.error(e);
    return res.status(500).send("無法創建課程。。。");
  }
});

// 讓學生透過課程id來註冊新課程
router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  try {
    let course = await Course.findOne({ _id }).exec();
    course.students.push(req.user._id);
    await course.save();
    return res.send("註冊完成");
  } catch (e) {
    return res.status(500).send(e); 
  }
});

router.delete("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  console.log({ _id })
  try {
    // 查找相應的課程
    let course = await Course.findOne({ _id }).exec();
    // 在學生列表中找到當前用戶的索引
    let index = course.students.indexOf(req.user._id);
    // 如果找到了用戶，則從學生列表中移除
    if (index !== -1) {
      course.students.splice(index, 1);
      await course.save();
      // 返回成功的響應
      return res.send("取消註冊成功");
    } else {
      // 如果未找到用戶，可能是因為用戶未註冊該課程
      return res.status(404).send("用戶未註冊該課程");
    }
  } catch (e) {
    return res.status(500).send(e); 
  }
});

router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  // 確認課程存在
  try {
    let courseFound = await Course.findOne({ _id }).exec();
    if (!courseFound) {
      return res.status(400).send("找不到課程。無法刪除課程。");
    }

    // 使用者必須是此課程講師，才能刪除課程
    if (courseFound.instructor.equals(req.user._id)) {
      await Course.deleteOne({ _id }).exec();
      return res.send("課程已被刪除。");
    } else {
      return res.status(403).send("只有此課程的講師才能刪除課程。");
    }
  } catch (e) {
    return res.status(500).send(e); 
  }
});

module.exports = router;