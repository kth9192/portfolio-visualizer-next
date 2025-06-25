import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { useRouter } from "next/router";
import { showToast } from "@/components/toast/customToast";
import { ApiError, ApiResponse, createApiResponse } from "@/app/interface/dto/api";

let isRefreshing = false;
let failedQueue: {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}[] = [];

const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  withCredentials: true,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiInstance.defaults.withCredentials = true;
apiInstance.defaults.headers.common.Accept = "application/json";

// 클라이언트 사이드에서만 localStorage 접근
const getStorageItem = (key: string): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};

const removeStorageItem = (key: string): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(key);
  }
};

apiInstance.interceptors.request.use(
  (config) => {
    const token = getStorageItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 재시도 큐 처리 함수
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiInstance.interceptors.response.use(
  (response):AxiosResponse<ApiResponse<any>> => {
    return  response ;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      // 401 오류이고 재시도되지 않은 요청인 경우
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        })
          .then((token) => {
            return apiInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStorageItem("refreshToken") ?? "";
    //   try {
    //     // 토큰 갱신 시도
    //     const res = await postRefreshToken(refreshToken);

    //     if (res.data.accessToken) {
    //       // 새 토큰 저장
    //       setStorageItem("accessToken", res.data.accessToken);
    //       if (res.data.refreshToken) {
    //         setStorageItem("refreshToken", res.data.refreshToken);
    //       }

    //       // 헤더에 새 토큰 적용
    //       apiInstance.defaults.headers.common.Authorization = `Bearer ${res.data.accessToken}`;

    //       // 대기 중인 요청들 처리
    //       processQueue(null, res.data.accessToken);

    //       // 원래 요청 재시도
    //       return apiInstance(originalRequest);
    //     } else {
    //       // 토큰 갱신 실패 - 로그인 페이지로 리디렉션
    //       processQueue(error, null);
          
    //       // 클라이언트 사이드에서만 리다이렉트
    //       if (typeof window !== "undefined") {
    //         // 토큰 제거
    //         removeStorageItem("accessToken");
    //         removeStorageItem("refreshToken");
            
    //         // 로그인 페이지로 리다이렉트
    //         window.location.href = "/login";
    //       }
          
    //       return Promise.reject(error);
    //     }
    //   } catch (refreshError) {
    //     // 토큰 갱신 에러 처리
    //     processQueue(refreshError, null);
        
    //     // 클라이언트 사이드에서만 리다이렉트
    //     if (typeof window !== "undefined") {
    //       // 토큰 제거
    //       removeStorageItem("accessToken");
    //       removeStorageItem("refreshToken");
          
    //       // 로그인 페이지로 리다이렉트
    //       window.location.href = "/login";
    //     }
        
    //     return Promise.reject(refreshError);
    //   } finally {
    //     isRefreshing = false;
    //   }
    }

    // 다른 오류 처리
    return handleApiError(error);
  }
);

const handleApiError = (error: AxiosError) => {
  if (error.code === "ECONNABORTED") {
    showToast.error("서버에서 응답 시간이 초과되었습니다.");
  }

  if (error.response && error.response.data) {
    const errorData = error.response.data as ApiError;
    showToast.error(errorData.message);
  }

  return Promise.reject(error);
};


export default apiInstance;