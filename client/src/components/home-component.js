import React from "react";
import { useNavigate } from "react-router-dom";


const HomeComponent = () => {

  const navigate = useNavigate();

  const handleEnrollButtonClick = () => {
    navigate("/enroll");
};
  const handlePostButtonClick = () => {
      navigate("/postCourse");
  };

  return (
    <main>
      <div className="container py-4">
        <div className="p-5 mb-4 bg-success rounded-3">
          <div className="container-fluid py-5">
            <h1 className="display-5 fw-bold">學習系統</h1>
            <p className="col-md-8 fs-4">
               歡迎來到我們的學習系統！學生可以尋找並參與各種課程，深化知識技能；而導師則有機會分享專業知識，啟發他人成長。讓我們一起探索學習的無限可能！
            </p>
            <label className="btn btn-primary btn-lg bg-secondary border border-white" style={{ cursor: "auto" }}>
              先註冊為「學生」或「導師」
            </label>
          </div>
        </div>

        <div className="row align-items-md-stretch">
          <div className="col-md-6">
            <div className="h-100 p-5 text-white bg-dark rounded-3">
              <h2>作為一個學生</h2>
              <p>
                學生可以註冊他們喜歡的課程。本網站僅供演示練習之用，請勿提供任何實際個人資料，例如信用卡號碼。
              </p>
              <button className="btn btn-outline-light" onClick={handleEnrollButtonClick} type="button">
                準備參與學習
              </button>
            </div>
          </div>
          <div className="col-md-6">
            <div className="h-100 p-5 bg-light border rounded-3">
              <h2>作為一個導師</h2>
              <p>
                您可以通過註冊成為一名講師，並開始製作在線課程。本網站僅供演示練習之用，請勿提供任何個人資料，例如信用卡號碼。
              </p>
              <button className="btn btn-outline-secondary"  onClick={handlePostButtonClick} type="button">
                開始開設課程
              </button>
            </div>
          </div>
        </div>

        <footer className="pt-3 mt-4 text-muted border-top">
          &copy; LIVE AND LEARN
        </footer>
      </div>
    </main>
  );
};

export default HomeComponent;
