import {
  PortfolioAssetDTO,
  PortfolioAssetReqDTO,
  PortfolioCreateDTO,
  PortfolioSettingCreateDTO,
  PortfolioSettingDTO,
} from "@/app/interface/dto/portfolio";
import { RebalanceFrequency } from "@/app/interface/enum/rebanalceFrequency";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface PortfolioStoreState extends PortfolioCreateDTO {
  setting: PortfolioSettingCreateDTO;
}

export interface PortfolioStoreActions {
  setName: (name: string) => void;
  setInitAmount: (amount: number) => void;
  setRebalanceFrequency: (frequency: RebalanceFrequency) => void;
  setAssets: (assets: PortfolioAssetReqDTO[]) => void;
  setUser_id: (id: string) => void;
  setDescription: (description: string) => void;

  addAsset: (asset: PortfolioAssetReqDTO) => void;
  updateSetting: (setting: PortfolioSettingCreateDTO) => void;
}

const initState = {
  name: "",
  initialAmount: 10000,
  rebalanceFrequency: RebalanceFrequency.MONTHLY,
  assets: [],
  setting: {
    startDate: null,
    endDate: null,
    rebalanceFrequency: RebalanceFrequency.MONTHLY,
  },
  user_id: "",
  description: "",
};

export const usePortfolioStore = create<
  PortfolioStoreState & PortfolioStoreActions
>()(
  devtools((set, get) => ({
    ...initState,

    setName: (name: string) => set({ name }),
    setInitAmount: (amount: number) => set({ initialAmount: amount }),
    setRebalanceFrequency: (frequency: RebalanceFrequency) =>
      set({ rebalanceFrequency: frequency }),
    setAssets: (assets: PortfolioAssetReqDTO[]) => set({ assets }),

    setUser_id: (id: string) => set({ user_id: id }),
    setDescription: (description: string) => set({ description }),
    addAsset: (asset: PortfolioAssetReqDTO) =>
      set({ assets: get().assets.concat(asset) }),
    updateSetting: (setting: PortfolioSettingCreateDTO) =>
      set({ setting: { ...get().setting, ...setting } }),
  }))
);
