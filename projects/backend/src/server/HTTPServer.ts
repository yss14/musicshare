import express from "express"
import Cors from "cors"
import Morgan from "morgan"
import { Server } from "net"
import { ApolloServer } from "apollo-server-express"
import { CustomRequestHandler } from "../types/context"

export interface IHTTPServerArgs {
	graphQLServer: ApolloServer
	authExtractor: CustomRequestHandler
}

export interface IHTTPServer {
	start(path: string, port: number): Promise<void>
	stop(): Promise<void>
}

export const HTTPServer = ({ graphQLServer, authExtractor }: IHTTPServerArgs): IHTTPServer => {
	let httpServer: Server
	const expressApp = express()

	expressApp.use(Cors())
	expressApp.disable("x-powered-by")
	expressApp.use(Morgan("dev"))
	expressApp.use(authExtractor as any)

	graphQLServer.applyMiddleware({ app: expressApp })

	const start = async (path: string, port: number) => {
		graphQLServer.setGraphQLPath(path)

		httpServer = expressApp.listen({ port })
	}

	const stop = () =>
		new Promise<void>((resolve) => {
			httpServer.close(() => resolve())
		})

	return { start, stop }
}
