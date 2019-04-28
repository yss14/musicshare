import * as Express from 'express';

export interface IContext {
	userID: string | null;
	scopes: Scopes;
}

export interface IShareScope {
	shareID: string;
	permissions: string[];
}

export type Scopes = IShareScope[];

export type ContextRequest = Express.Request & { context: IContext };
export type CustomRequestHandler = (req: ContextRequest, res: Express.Response, next: Express.NextFunction) => any;