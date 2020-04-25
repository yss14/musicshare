import { Either, isLeft, isRight } from "../../types/Either"
import { IResponse } from "./responses"
import { CustomExpressRequestHandler } from "./request-handler"

export type TypedRequestMiddleware<R, T> = (request: R) => Promise<Either<IResponse, T>>

type TRM<R, T> = TypedRequestMiddleware<R, T>

// Waiting for variadic generics to make this less verbose
// https://github.com/Microsoft/TypeScript/issues/5453

// tslint:disable:max-func-args
export const withMiddleware: {
	<R>(): (handler: (req: R) => Promise<IResponse>) => CustomExpressRequestHandler<R>
	<R, T>(m1: TRM<R, T>): (handler: (req: R, v1: T) => Promise<IResponse>) => CustomExpressRequestHandler<R>
	<R, T, K>(m1: TRM<R, T>, m2: TRM<R, K>): (
		handler: (req: R, v1: T, v2: K) => Promise<IResponse>,
	) => CustomExpressRequestHandler<R>
	<R, T, K, V>(m1: TRM<R, T>, m2: TRM<R, K>, m3: TRM<R, V>): (
		handler: (req: R, v1: T, v2: K, v3: V) => Promise<IResponse>,
	) => CustomExpressRequestHandler<R>
	<R, T, K, V, S>(m1: TRM<R, T>, m2: TRM<R, K>, m3: TRM<R, V>, m4: TRM<R, S>): (
		handler: (req: R, v1: T, v2: K, v3: V, v4: S) => Promise<IResponse>,
	) => CustomExpressRequestHandler<R>
} = <R, T, K, V, S>(m1?: TRM<R, T>, m2?: TRM<R, K>, m3?: TRM<R, V>, m4?: TRM<R, S>) => (
	handler: (req: R, v1?: T, v2?: K, v3?: V, v4?: S) => Promise<IResponse>,
): CustomExpressRequestHandler<R> => {
	return async (req: R) => {
		return new Promise<IResponse>((resolve, reject) => {
			if (m1) {
				m1(req).then((response1) => {
					if (isLeft(response1)) {
						resolve(response1.left)
					} else if (isRight(response1)) {
						if (m2) {
							m2(req).then((response2) => {
								if (isLeft(response2)) {
									resolve(response2.left)
								} else if (isRight(response2)) {
									if (m3) {
										m3(req).then((response3) => {
											if (isLeft(response3)) {
												resolve(response3.left)
											} else if (isRight(response3)) {
												if (m4) {
													m4(req).then((response4) => {
														if (isLeft(response4)) {
															resolve(response4.left)
														} else if (isRight(response4)) {
															handler(
																req,
																response1.right,
																response2.right,
																response3.right,
																response4.right,
															).then(resolve, reject)
														}
													}, reject)
												} else {
													handler(
														req,
														response1.right,
														response2.right,
														response3.right,
													).then(resolve, reject)
												}
											}
										}, reject)
									} else {
										handler(req, response1.right, response2.right).then(resolve, reject)
									}
								}
							}, reject)
						} else {
							handler(req, response1.right).then(resolve, reject)
						}
					}
				}, reject)
			} else {
				handler(req).then(resolve, reject)
			}
		})
	}
}
