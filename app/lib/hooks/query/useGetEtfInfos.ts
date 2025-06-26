
import { useQuery, useQueryClient ,type UseQueryOptions } from '@tanstack/react-query'
import { getETFList } from '@/api/etf'
import { ETFInfoDTO } from '@/app/interface/dto/etf'
import { queryKeys } from './keys'
import { AxiosResponse } from 'axios'
import { ApiResponse } from '@/app/interface/dto/api'

interface useGetEtfInfosProps{
  optios?:Omit<UseQueryOptions<AxiosResponse<ApiResponse<ETFInfoDTO[]>>, Error, ETFInfoDTO[], readonly unknown[]>, 'queryKey' | 'queryFn'>
}

function useGetEtfInfos({optios}:useGetEtfInfosProps) {

  return useQuery({
    queryKey: queryKeys.list,
    queryFn: getETFList,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 3,
    refetchOnWindowFocus: false,
    ...optios
  })
}

export default useGetEtfInfos