import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseService from "../services/course.service";

const CourseComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  const handleTakeToLogin = () => {
    navigate("/login");
  };
  const [courseData, setCourseData] = useState(null);

  // 輔助函數：用於獲取當前用戶的課程數據
const fetchCourses = async () => {
    // 🚨 關鍵修正：新增對 .user 屬性的檢查，防止其在讀取 _id 和 role 時崩潰
    if (!currentUser || !currentUser.user) return; 

    const _id = currentUser.user._id;
    const role = currentUser.user.role;

    try {
        let response;
        if (role === "instructor") {
            // 講師：獲取他創建的課程
            response = await CourseService.get(_id);
        } else if (role === "student") {
            // 學生：獲取他註冊的課程
            response = await CourseService.getEnrolledCourses(_id);
        }
        setCourseData(response.data);
    } catch (e) {
        // 確保捕獲了來自 CourseService 的錯誤
        console.error("獲取課程數據失敗:", e.response ? e.response.data : e);
    }
};

  useEffect(() => {
    fetchCourses();
  }, [currentUser]); // 將 currentUser 加入依賴項

  const cancel = async (e) => {
    const courseId = e.target.id;
    const role = currentUser.user.role;
    let apiCall;
    let successMessage;

    // 🚨 修正二：根據用戶角色決定要呼叫的 API
    if (role === "instructor") {
      apiCall = CourseService.deleteCourse(courseId);
      successMessage = "課程已成功刪除！";
    } else if (role === "student") {
      apiCall = CourseService.cancelEnroll(courseId);
      successMessage = "課程取消註冊成功！";
    } else {
      return window.alert("您的角色無權進行此操作。");
    }

    try {
      await apiCall;
      
      // 更新本地狀態：移除被刪除或取消註冊的課程
      setCourseData(courseData.filter(course => course._id !== courseId));
      window.alert(successMessage);
      
    } catch (e) {
      // 🚨 修正三：捕獲並顯示錯誤訊息 (包括後端傳來的 403 訊息)
      console.error("操作失敗:", e.response ? e.response.data : e);
      const errorMessage = e.response && e.response.data 
        ? e.response.data 
        : "操作失敗，請檢查權限或稍後再試。";
      window.alert(errorMessage);
    }
  };

  return (
    <div style={{ padding: "3rem" }}>
      {!currentUser && (
        <div>
          <p>您必須先登入才能看到課程。</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleTakeToLogin}
          >
            回到登入頁面
          </button>
        </div>
      )}
      {currentUser && currentUser.user.role === "instructor" && (
        <div>
          <h1>歡迎來到講師的課程頁面，以下為您建立的課程。</h1>
        </div>
      )}
      {currentUser && currentUser.user.role === "student" && (
        <div>
          <h1>歡迎來到學生的課程頁面，以下為您註冊的課程。</h1>
        </div>
      )}
      
      {/* 顯示課程列表 */}
      {currentUser && courseData && courseData.length !== 0 && (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {courseData.map((course) => {
            return (
              <div 
                key={course._id} 
                className="card enrolled" 
                style={{ width: "20rem", margin: "1rem", alignItems: "center" }}
              >
                <div className="card-body">
                  <h5 className="card-title">課程名稱</h5>
                  <h5 className="font-weight-bold">{course.title}</h5>
                  <p style={{ margin: "0.5rem 0rem" }} className="card-text">
                    {course.description}
                  </p>
                  <p style={{ margin: "0.5rem 0rem" }}>
                    學生人數: {course.students.length}
                  </p>
                  <p style={{ margin: "0.5rem 0rem" }}>
                    課程價格: {course.price}
                  </p>
                  <img 
                    src={course.base64String} 
                    alt={course.title} 
                    style={{ margin: "0.5rem 0rem", width: "100%", maxHeight: "300px" }} 
                  />
                  
                  {/* 根據角色顯示不同的按鈕 */}
                  <div style={{ textAlign: "center" }}>
                    {currentUser.user.role === "instructor" && (
                      <button // 講師刪除
                        id={course._id}
                        className="btn btn-danger card-text"
                        onClick={cancel}
                      >
                        刪除課程
                      </button>
                    )}
                    {currentUser.user.role === "student" && (
                      <button // 學生取消註冊
                        id={course._id}
                        className="btn btn-warning card-text"
                        onClick={cancel}
                      >
                        取消註冊
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* 處理沒有課程的情況 */}
      {currentUser && courseData && courseData.length === 0 && (
          <p>目前沒有任何課程可以顯示。</p>
      )}
    </div>
  );
};

export default CourseComponent;