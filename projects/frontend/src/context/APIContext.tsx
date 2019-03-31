import { MusicShareAPI } from "../apis/musicshare-api";
import { createContext } from "react";
import { IAPIs } from "../apis/make-apis";

interface IAPIContext {
	musicshareAPI: MusicShareAPI;
}

export let APIContext: React.Context<IAPIContext>;

export const makeAPIContext = (apis: IAPIs) => {
	APIContext = createContext<IAPIContext>(makeAPIContextValue(apis));

	return APIContext;
}

export const makeAPIContextValue = ({ musicshare }: IAPIs): IAPIContext => ({
	musicshareAPI: musicshare
});
