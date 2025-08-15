import { ApiResponse } from "@/app/interface/dto/api";
import apiInstance from "./apiInstance";
import { GuestLoginRes } from "@/app/interface/dto/auth";

export  const postGuestLogin = async (): Promise<ApiResponse<GuestLoginRes>> => {
    const response = await apiInstance.post<ApiResponse<GuestLoginRes>>("/guest");
    return response.data;
};

export const postLogout = async (): Promise<ApiResponse<void>> => {
    const response = await apiInstance.post<ApiResponse<void>>("/logout");
    return response.data;
};