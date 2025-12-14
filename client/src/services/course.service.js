import axios from "axios";

// 使用環境變數讀取後端基礎 URL
const API_BASE_URL = "";
const API_URL = API_BASE_URL + "/api/courses"; 

// 輔助函數：用於獲取 Token 並附加正確的前綴
const getAuthHeaders = () => {
    let tokenWithPrefix = "";
    
    // 檢查 localStorage 中是否有 'user' 物件
    const userItem = localStorage.getItem("user");
    
    if (userItem) {
        try {
            // 從 localStorage 中取出包含 "JWT " 前綴的完整字串
            tokenWithPrefix = JSON.parse(userItem).token;
        } catch (e) {
            // 如果 JSON 解析失敗，視為無效用戶
            console.error("解析 localStorage 中的用戶資料失敗:", e);
            return null;
        }
    } 
    
    // 🚨 關鍵修正：如果沒有 Token 或 Token 為空，返回 null
    if (!tokenWithPrefix) {
        return null;
    }

    // 返回帶有完整 "JWT <token>" 字串的 Header 物件
    return {
        headers: {
            Authorization: tokenWithPrefix, 
        },
    };
};

class CourseService {
    
    // 統一處理 API 呼叫的輔助函數
    handleApiCall(method, url, data = null) {
        const headers = getAuthHeaders();
        
        // 🚨 關鍵檢查：如果沒有 Token，返回一個立即失敗的 Promise
        if (!headers) {
            // 返回一個模擬 Axios 錯誤的 Promise，以便在元件中捕獲
            return Promise.reject({
                response: { 
                    status: 403, 
                    data: "請先登入才能存取此內容。",
                },
                message: "未經授權的請求: 無 Token",
                isTokenMissing: true // 自定義標記
            });
        }
        
        // 根據 method 執行 axios 請求
        switch (method) {
            case 'get':
                return axios.get(url, headers);
            case 'post':
                return axios.post(url, data, headers);
            case 'delete':
                return axios.delete(url, headers);
            default:
                return Promise.reject(new Error(`不支援的 HTTP 方法: ${method}`));
        }
    }

    // 新增課程 (POST /api/courses)
    post(title, description, price, base64String) {
        return this.handleApiCall('post', API_URL, { title, description, price, base64String });
    }

    // 獲得系統中的所有課程 (GET /api/courses)
    getCourseAll() {
        return this.handleApiCall('get', API_URL);
    }

    // 用講師id來尋找課程 (GET /api/courses/instructor/:_instructor_id)
    get(_id) {
        return this.handleApiCall('get', API_URL + "/instructor/" + _id);
    }
    
    // 用學生id來尋找註冊過的課程 (GET /api/courses/student/:_student_id)
    getEnrolledCourses(_id) {
        return this.handleApiCall('get', API_URL + "/student/" + _id);
    }

    // 用課程名稱尋找課程 (GET /api/courses/findByName/:name)
    getCourseByName(name) {
        return this.handleApiCall('get', API_URL + "/findByName/" + name);
    }
    
    // 讓學生透過課程id來註冊新課程 (POST /api/courses/enroll/:_id)
    enroll(_id) {
        return this.handleApiCall('post', API_URL + "/enroll/" + _id, {});
    }
    
    // 取消註冊 (DELETE /api/courses/enroll/:courseId)
    cancelEnroll(courseId) {
        return this.handleApiCall('delete', `${API_URL}/enroll/${courseId}`);
    }  

    // 刪除課程 (DELETE /api/courses/:courseIds)
    deleteCourse(courseIds) {
        return this.handleApiCall('delete', `${API_URL}/${courseIds}`);
    }  
}

export default new CourseService();