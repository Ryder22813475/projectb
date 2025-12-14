import axios from "axios";

// 🚨 關鍵修改：從環境變數讀取後端基礎 URL
const API_BASE_URL = "";

// 組合完整的 API 路徑：[Render URL]/api/user
const API_URL = API_BASE_URL + "/api/user"; 

class AuthService {
    login(email, password) {
        return axios.post(API_URL + "/login", { email, password }); 
    }
    logout() {
        localStorage.removeItem("user");
    }
    register(username, email, password, role) {
        return axios.post(API_URL + "/register", {
            username,
            email,
            password,
            role,
        });
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem("user"));
    }
}

export default new AuthService();