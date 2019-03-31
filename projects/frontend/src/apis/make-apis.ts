import { MusicShareAPI } from "./musicshare-api";
import { IConfig } from "../types/other/config";

export interface IAPIs {
	musicshare: MusicShareAPI;
}

export const makeAPIs = (config: IConfig): IAPIs => ({
	musicshare: new MusicShareAPI(config.services.musicshare.backendURL)
});