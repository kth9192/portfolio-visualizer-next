export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  statusCode: number;
}

export const createApiResponse = (data: any, success: boolean, message: string, statusCode: number): ApiResponse<any> => {
    return {
        success,
        data,
        message,
        statusCode
    }
}

// API 에러 타입 정의
export interface ApiError {
    message: string;
    code?: string;
    status?: number;
  }