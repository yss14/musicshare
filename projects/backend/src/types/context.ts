import * as Express from 'express';
import { Permission } from '../auth/permissions';
import { IPlaylistService } from '../services/PlaylistService';
import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { ISongService } from '../services/SongService';
import { IShareService } from '../services/ShareService';

export interface IBaseContext {
	userID: string | null;
	scopes: Scopes;
}

export interface IGraphQLContext extends IBaseContext {
	userID: string;
	services: {
		playlistService: IPlaylistService;
		songService: ISongService;
		shareService: IShareService;
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
	shareService: IShareService;
}

export const makeGraphQLContextProvider = ({ playlistService, songService, shareService }: IGraphQLContextProviderArgs): ContextFunction<ExpressContext, IGraphQLContext> =>
	({ req }: { req: ContextRequest }): IGraphQLContext => {
		if (req.context.userID === null) {
			throw new Error('Cannot create graphql context: userID is null');
		}

		return {
			...req.context,
			userID: req.context.userID,
			services: {
				playlistService,
				songService,
				shareService,
			}
		};
	}