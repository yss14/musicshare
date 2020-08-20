import { PaginatedQueryResult } from "react-query"
import { useMemo } from "react"

export const useMemoizedResult = <TIn, TOut>(result: PaginatedQueryResult<TIn>, transformFn: (data: TIn) => TOut) => {
	const memoizedQueryResult = useMemo(() => {
		const transormedData = result.latestData ? transformFn(result.latestData) : undefined
		const tranformedResolvedData = result.resolvedData ? transformFn(result.resolvedData) : undefined
		return {
			...result,
			data: transormedData,
			resolvedData: tranformedResolvedData,
		}
	}, [result, transformFn])

	return memoizedQueryResult
}
