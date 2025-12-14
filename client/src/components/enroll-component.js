import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseService from "../services/course.service";

const EnrollComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  let [searchInput, setSearchInput] = useState("");
  let [searchResult, setSearchResult] = useState(null); 
  const [courseData, setCourseData] = useState(null);
  const [courseEnrollId, setCourseEnrollId] = useState([]); // 設置為空陣列
  
  const handleTakeToLogin = () => {
    navigate("/login");
  };

  // 🚨 修正一：在 useEffect 內部統一處理數據載入邏輯
  useEffect(() => {
    // 關鍵檢查：如果用戶未登入，則不執行任何 API 請求
    if (!currentUser || !currentUser.user) {
        // 如果未登入但來到這裡，讓 searchResult 保持 null 或設置為空，以便渲染登入提示
        setSearchResult(null);
        return;
    }

    const fetchCourseData = async () => {
        try {
            // 1. 獲取所有已註冊的課程 ID ( handleElse 邏輯)
            const enrolledResponse = await CourseService.getEnrolledCourses(currentUser.user._id);
            const enrolledIds = enrolledResponse.data.map(course => course._id);
            setCourseEnrollId(enrolledIds);
            
            // 2. 獲取所有課程 ( handleAll 邏輯)
            const allCoursesResponse = await CourseService.getCourseAll();
            setCourseData(allCoursesResponse.data);
            setSearchResult(allCoursesResponse.data); // 初始設置為所有課程
            
        } catch (e) {
            // 🚨 統一捕獲兩個 API 呼叫的錯誤
            console.error("載入課程數據失敗:", e.response ? e.response.data : e);
            // 可以通知用戶載入失敗
            // window.alert("課程載入失敗，請檢查權限或登入狀態。");
        }
    };
    
    // 只有在 currentUser 存在且不是講師時才執行，但因為 API 請求會處理講師/學生，所以這裡只需檢查登入狀態
    fetchCourseData();
  }, [currentUser]); // 依賴於 currentUser 狀態

  const handleChangeInput = (e) => {
      // 在輸入時進行篩選，而不是每次都點擊按鈕
      handleSearch(e.target.value); 
  };

  const handleSearch = (input) => {
    if (!courseData) return; // 如果課程數據還沒載入，則退出
    
    if (!input || !input.trim()) {
      setSearchResult(courseData); // 如果搜索條件為空，顯示所有課程
    } else {
      const filteredCourses = courseData.filter(course =>
        course.title.toLowerCase().includes(input.toLowerCase())
      );
      setSearchResult(filteredCourses);
    }
  };

  const handleEnroll = async (e) => {
    const courseId = e.target.id;
    try {
      await CourseService.enroll(courseId);
      window.alert("課程註冊成功!! 重新導向到課程頁面。");
      navigate("/course");
    } catch (e) {
      // 🚨 修正二：加入 try...catch 捕獲註冊錯誤
      const errorMessage = e.response && e.response.data 
        ? e.response.data 
        : "課程註冊失敗，請稍後再試。";
      window.alert(errorMessage);
      console.error("註冊失敗:", e.response ? e.response.data : e);
    }
  };

  const cancelEnroll = async (e) => {
    const courseId = e.target.id;
    try {
      await CourseService.cancelEnroll(courseId);
      window.alert("課程取消註冊成功！");
      navigate("/course");
    } catch (e) {
      // 🚨 修正三：加入 try...catch 捕獲取消註冊錯誤
      const errorMessage = e.response && e.response.data 
        ? e.response.data 
        : "課程取消註冊失敗，請稍後再試。";
      window.alert(errorMessage);
      console.error("取消註冊失敗:", e.response ? e.response.data : e);
    }
  };

  return (
    <div style={{ padding: "3rem" }}>
      {/* 渲染邏輯不變 */}
      {!currentUser && (
        // ... 登入提示
        <div>
          <p>您必須先登入才能開始註冊課程。</p>
          <button
            className="btn btn-primary btn-lg"
            onClick={handleTakeToLogin}
          >
            回到登入頁面
          </button>
        </div>
      )}

      {currentUser && currentUser.user.role == "instructor" && (
        <div>
          <h1>只有學生才能夠註冊課程</h1>
        </div>
      )}

      {currentUser && currentUser.user.role == "student" && (
        <div className="search input-group mb-3">
          <input
            type="text"
            className="form-control"
            onChange={handleChangeInput}
          />
          {/* 修正：移除 onClick={handleSearch} 避免雙重觸發，因為在 onChange 已處理 */}
          {/* <button className="btn btn-primary"> 搜尋課程 </button> */}
        </div>
      )}

      {currentUser && currentUser.user.role == "student" && searchResult && searchResult.length !== 0 && (
        <div>
          <p>相關課程資訊如下</p>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {searchResult.map((course) => {
              return (
                <div
                  key={course._id}
                  className={`card ${courseEnrollId.includes(course._id) ? 'enrolled' : ''}`}
                  style={{ width: "20rem", margin: "1rem", alignItems: "center" }}
                >
                  <div className="card-body">
                    <img src={course.base64String} style={{ margin: "0.5rem 0rem" ,width:"100%", maxHeight:"300px"}} alt={course.title} />
                    <h5 className="card-title">
                      課程名稱 <br />
                      {course.title}
                    </h5>
                    <p style={{ margin: "0.5rem 0rem" }} className="card-text">
                      {course.description}
                    </p>
                    <p style={{ margin: "0.5rem 0rem" }}>
                      學生人數: {course.students.length}
                    </p>
                    <p style={{ margin: "0.5rem 0rem" }}>
                      課程價格: {course.price}
                    </p>
                    <p style={{ margin: "0.5rem 0rem" }}>
                      講師: {course.instructor.username}
                    </p>
                    <div style={{ textAlign:"center" }}>
                      {/* 註冊按鈕 */}
                      {!courseEnrollId.includes(course._id) && (
                        <a
                          href="#"
                          id={course._id}
                          className="btn btn-primary card-text"
                          onClick={handleEnroll}
                          style={{backgroundColor:" #4CAF50"}}
                        >
                          註冊課程
                        </a>
                      )}
                      {/* 取消註冊按鈕 */}
                      {courseEnrollId.includes(course._id) && (
                        <a
                          href="#"
                          id={course._id}
                          className="btn btn-warning card-text"
                          onClick={cancelEnroll}
                          style={{backgroundColor:"#FFC107"}}
                        >
                          取消註冊
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {currentUser && currentUser.user.role == "student" && searchResult && searchResult.length === 0 && (
        <p>找不到符合條件的課程。</p>
      )}
    </div>
  );
};

export default EnrollComponent;