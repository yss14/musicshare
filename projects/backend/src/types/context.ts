import * as Express from 'express';
import { Permission } from '../auth/permissions';
import { ContextFunction } from 'apollo-server-core';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { IServices } from '../services/services';
import { Share } from '../models/ShareModel';

export interface IBaseContext {
	userID: string | null;
	scopes: Scopes;
	error?: {
		statusCode: number;
		message: string;
	};
	authToken?: string;
}

export interface IGraphQLContext extends IBaseContext {
	services: IServices,
	share?: Share;
}

export interface IShareScope {
	shareID: string;
	permissions: Permission[];
}

export type Scopes = IShareScope[];

export type ContextRequest = Express.Request & { context: IBaseContext };
export type CustomRequestHandler = (req: ContextRequest, res: Express.Response, next: Express.NextFunction) => any;

export const makeGraphQLContextProvider = (services: IServices): ContextFunction<ExpressContext, IGraphQLContext> =>
	({ req }: { req: ContextRequest }): IGraphQLContext => {
		return {
			...req.context,
			services,
		};
	}