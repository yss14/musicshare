import { useEffect, useRef } from "react"
import deepEqual from "dequal"

// taken from https://github.com/kentcdodds/use-deep-compare-effect

const useDeepCompareMemoize = (value?: React.DependencyList) => {
	const ref = useRef<React.DependencyList>()

	if (!deepEqual(value, ref.current)) {
		ref.current = value
	}

	return ref.current
}

export const useDeepCompareEffect: typeof useEffect = (callback, dependencies) => {
	useEffect(callback, useDeepCompareMemoize(dependencies))
}
