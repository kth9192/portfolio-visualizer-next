// lib/api/apiInstance.ts
import { ApiError, ApiResponse } from "@/app/interface/dto/api";
import { showToast } from "@/components/toast/customToast";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// 타입 정의
interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: AxiosRequestConfig;
}

interface RetryableRequest extends AxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

// 토큰 갱신 상태 관리
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  withCredentials: true,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// 클라이언트 사이드에서만 localStorage 접근
const getStorageItem = (key: string): string | null => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get item from localStorage: ${key}`, error);
      return null;
    }
  }
  return null;
};

const setStorageItem = (key: string, value: string): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set item to localStorage: ${key}`, error);
    }
  }
};

const removeStorageItem = (key: string): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove item from localStorage: ${key}`, error);
    }
  }
};

// 재시도 큐 처리 함수
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 토큰 갱신 API 호출
const postRefreshToken = async (refreshToken: string): Promise<{ data: RefreshTokenResponse }> => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE}/auth/refresh`, {
      refreshToken,
    });
    return response;
  } catch (error) {
    throw new Error('토큰 갱신에 실패했습니다.');
  }
};

// 인증 실패 처리
const handleAuthFailure = (): void => {
  if (typeof window !== "undefined") {
    removeStorageItem("accessToken");
    removeStorageItem("refreshToken");
    window.location.href = "/login";
  }
};

apiInstance.interceptors.request.use(
  (config) => {
    const token = getStorageItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiInstance.interceptors.response.use(
  (response): AxiosResponse<ApiResponse<unknown>> => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest;

    if (error.response?.status === 401 && !originalRequest._retry) {
      // 401 오류이고 재시도되지 않은 요청인 경우
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        })
          .then(() => {
            return apiInstance(originalRequest);
          })
          .catch((err: unknown) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getStorageItem("refreshToken") ?? "";

      if (!refreshToken) {
        processQueue(error, null);
        handleAuthFailure();
        return Promise.reject(error);
      }

      try {
        // 토큰 갱신 시도
        const res = await postRefreshToken(refreshToken);

        if (res.data.accessToken) {
          // 새 토큰 저장
          setStorageItem("accessToken", res.data.accessToken);
          if (res.data.refreshToken) {
            setStorageItem("refreshToken", res.data.refreshToken);
          }

          // 헤더에 새 토큰 적용
          if (apiInstance.defaults.headers.common) {
            apiInstance.defaults.headers.common.Authorization = `Bearer ${res.data.accessToken}`;
          }

          // 대기 중인 요청들 처리
          processQueue(null, res.data.accessToken);

          // 원래 요청 재시도
          return apiInstance(originalRequest);
        } else {
          // 토큰 갱신 실패 - 로그인 페이지로 리디렉션
          processQueue(error, null);
          handleAuthFailure();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // 토큰 갱신 에러 처리
        processQueue(refreshError, null);
        handleAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 다른 오류 처리
    return handleApiError(error);
  }
);

const handleApiError = (error: AxiosError): Promise<never> => {
  if (error.code === "ECONNABORTED") {
    showToast.error("서버에서 응답 시간이 초과되었습니다.");
  }

  if (error.response?.data) {
    const errorData = error.response.data as ApiError;
    showToast.error(errorData.message || "알 수 없는 오류가 발생했습니다.");
  } else {
    showToast.error("네트워크 오류가 발생했습니다.");
  }

  return Promise.reject(error);
};

export default apiInstance;