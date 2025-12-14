import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CourseService from "../services/course.service";

const EnrollComponent = ({ currentUser, setCurrentUser }) => {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const handleTakeToLogin = () => {
    navigate("/login");
  };

  // 處理課程註冊
  const handleEnroll = async (e) => {
    try {
      await CourseService.enroll(e.target.id);
      window.alert("課程註冊成功！重新導向到我的課程頁面。");
      navigate("/course"); // 註冊成功後導向我的課程頁面
    } catch (error) {
      console.error(error.response);
      window.alert(error.response.data);
    }
  };

  // 處理課程搜尋
  const handleChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearch = async () => {
    try {
      let result = await CourseService.getCourseByName(search);
      
      // 增加防禦性檢查：確保返回的是陣列
      const data = result.data;
      if (Array.isArray(data)) {
        setCourseData(data);
      } else {
        // 處理非預期結構
        setCourseData([]);
        setMessage("搜尋結果非預期，請重試。");
      }

    } catch (e) {
      console.error(e);
      setCourseData([]);
      setMessage(e.response.data);
    }
  };

  // 初始化時載入所有課程 (或在搜尋結果清空時)
  useEffect(() => {
    // 如果沒有登入狀態，不執行獲取
    if (!currentUser) return; 

    // 只有學生才能看到所有課程
    if (currentUser.user.role === "student") {
      CourseService.getAllCourses()
        .then((response) => {
          const data = response.data;

          // 增加防禦性檢查
          if (Array.isArray(data)) {
            setCourseData(data);
          } else {
            setCourseData([]);
            setMessage("無法載入課程列表，伺服器返回非預期格式。");
          }
        })
        .catch((error) => {
          console.error("載入所有課程失敗:", error.response);
          setCourseData([]);
          setMessage("載入課程列表失敗，請檢查網路連線。");
        });
    }
  }, [currentUser]); // 依賴項為 currentUser，確保登入狀態改變時重新載入

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
          <h1>只有學生才能看到所有課程。</h1>
        </div>
      )}
      {currentUser && currentUser.user.role === "student" && (
        <div>
          <h1>歡迎來到選課頁面。</h1>
          <div className="input-group mb-3">
            <input
              onChange={handleChange}
              type="text"
              className="form-control"
              placeholder="輸入課程名稱來搜尋"
            />
            <button
              onClick={handleSearch}
              className="btn btn-primary"
            >
              搜尋
            </button>
          </div>

          {message && <div className="alert alert-warning">{message}</div>}

          {courseData && courseData.length !== 0 && (
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {courseData.map((course) => {
                
                // 這是發生錯誤的區塊，我們在這裡進行防禦性檢查
                // ----------------------------------------------------
                const instructor = course.instructor; // 導師物件，可能為 null

                return (
                  <div 
                    key={course._id} 
                    className="card" 
                    style={{ width: "20rem", margin: "1rem", alignItems: "center" }}
                  >
                    <div className="card-body">
                      <h5 className="card-title">課程名稱</h5>
                      <h5 className="font-weight-bold">{course.title}</h5>
                      <p style={{ margin: "0.5rem 0rem" }} className="card-text">
                        {course.description}
                      </p>
                      
                      {/* ✅ 關鍵修正區塊：檢查導師是否存在 */}
                      {instructor ? (
                        <>
                          <p style={{ margin: "0.5rem 0rem" }}>
                            講師: {instructor.username}
                          </p>
                          <p style={{ margin: "0.5rem 0rem" }}>
                            價格: {course.price}
                          </p>
                        </>
                      ) : (
                        // 錯誤處理訊息：導師不存在
                        <div style={{ color: "red", padding: "0.5rem 0" }}>
                          <p style={{ margin: 0 }}>講師: [老師已下架課程/帳號已刪除]</p>
                          <p style={{ margin: 0 }}>價格: N/A</p>
                        </div>
                      )}
                      {/* ---------------------------------------------------- */}

                      <p style={{ margin: "0.5rem 0rem" }}>
                        學生人數: {course.students.length}
                      </p>
                      
                      <img 
                        src={course.base64String} 
                        alt={course.title} 
                        style={{ margin: "0.5rem 0rem", width: "100%", maxHeight: "300px" }} 
                      />
                      
                      {/* 註冊按鈕只在導師存在時顯示，否則不能註冊 */}
                      {instructor && (
                        <button
                          onClick={handleEnroll}
                          className="btn btn-primary"
                          id={course._id}
                        >
                          註冊課程
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EnrollComponent;