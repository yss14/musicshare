import * as Express from 'express';
import { Permission } from '../auth/permissions';
import { IPlaylistService } from '../services/PlaylistService';
import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { ISongService } from '../services/SongService';

export interface IBaseContext {
	userID: string | null;
	scopes: Scopes;
}

export interface IGraphQLContext extends IBaseContext {
	services: {
		playlistService: IPlaylistService;
		songService: ISongService;
	}
}

export interface IShareScope {
	shareID: string;
	permissions: Permission[];
}

export type Scopes = IShareScope[];

export type ContextRequest = Express.Request & { context: IBaseContext };
export type CustomRequestHandler = (req: ContextRequest, res: Express.Response, next: Express.NextFunction) => any;

interface IGraphQLContextProviderArgs {
	playlistService: IPlaylistService;
	songService: ISongService;
}

export const makeGraphQLContextProvider = ({ playlistService, songService }: IGraphQLContextProviderArgs): ContextFunction<ExpressContext, IGraphQLContext> =>
	({ req }: { req: ContextRequest }): IGraphQLContext => {
		return {
			...req.context,
			services: {
				playlistService,
				songService,
			}
		};
	}