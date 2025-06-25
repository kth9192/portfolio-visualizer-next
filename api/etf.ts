import apiInstance from "./apiInstance";
import { ETFInfoDTO } from "@/app/interface/dto/etf";
import { ApiResponse } from "@/app/interface/dto/api";
import { AxiosResponse } from "axios";

export const getETFList = async (): Promise<AxiosResponse<ApiResponse<ETFInfoDTO[]>>> => {
    const response = await apiInstance.get("/etf");
    console.log('getetflist',response);
    
    return response.data;
}

export const getSearchEtf = async(ticker:string) : Promise<AxiosResponse<ApiResponse<ETFInfoDTO[]>>> =>{
const response = await apiInstance.get("/etf/search",{
    params:{
        ticker
    }
});

return response;
}