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

interface PortfolioStoreState extends PortfolioCreateDTO {
  setting: PortfolioSettingCreateDTO;
}

interface PortfolioStoreActions {
  setName: (name: string) => void;
  setInitAmount: (amount: number) => void;
  setRebalanceFrequency: (frequency: RebalanceFrequency) => void;
  setAssets: (assets: PortfolioAssetReqDTO[]) => void;
  setUser_id: (id: string) => void;
  setDescription: (description: string) => void;
  
  addAsset: (asset: PortfolioAssetReqDTO) => void;
  updateSetting : (setting: PortfolioSettingCreateDTO) => void;
}

export const usePortfolioStore = create<
  PortfolioStoreState & PortfolioStoreActions
>()(
  devtools((set, get) => ({
    name: "",
    initAmount: 0,
    rebalanceFrequency: RebalanceFrequency.MONTHLY,
    assets: [],
    setting : {
      startDate: null,
      endDate: null,
      rebalanceFrequency: RebalanceFrequency.MONTHLY,
    },
    user_id: "",
    description: "",

    setName: (name: string) => set({ name }),
    setInitAmount: (amount: number) => set({ initAmount: amount }),
    setRebalanceFrequency: (frequency: RebalanceFrequency) =>
      set({ rebalanceFrequency: frequency }),
    setAssets: (assets: PortfolioAssetReqDTO[]) => set({ assets }),

    setUser_id: (id: string) => set({ user_id: id }),
    setDescription: (description: string) => set({ description }),
    addAsset: (asset: PortfolioAssetReqDTO) =>
      set({ assets: get().assets.concat(asset) }),
    updateSetting : (setting: PortfolioSettingCreateDTO) => set({ setting: {...get().setting, ...setting} }),
  }))
);
