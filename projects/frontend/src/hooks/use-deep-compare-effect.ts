import { useEffect, useRef } from "react"
import { dequal } from "dequal"

// taken from https://github.com/kentcdodds/use-deep-compare-effect

const useDeepCompareMemoize = (value?: React.DependencyList) => {
	const ref = useRef<React.DependencyList>()

	if (!dequal(value, ref.current)) {
		ref.current = value
	}

	return ref.current
}

export const useDeepCompareEffect: typeof useEffect = (callback, dependencies) => {
	// eslint-disable-next-line
	useEffect(callback, useDeepCompareMemoize([dependencies, callback]))
}
