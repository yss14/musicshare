import { QueryResult } from "react-query"
import { useMemo } from "react"

export const useMemoizedResult = <TIn, TOut>(result: QueryResult<TIn>, transformFn: (data: TIn) => TOut) => {
	const memoizedQueryResult = useMemo(() => {
		const transormedData = result.data ? transformFn(result.data) : undefined
		return {
			...result,
			data: transormedData,
		}
	}, [result, transformFn])

	return memoizedQueryResult
}
