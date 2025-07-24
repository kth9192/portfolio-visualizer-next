import { ApiResponse } from "@/app/interface/dto/api";
import apiInstance from "./apiInstance";
import { GuestLoginRes } from "@/app/interface/dto/auth";

export  const getGuestLogin = async (): Promise<ApiResponse<GuestLoginRes>> => {
    const response = await apiInstance.post<ApiResponse<GuestLoginRes>>("/guest");
    return response.data;
};