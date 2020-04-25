import { createPrefilledArray } from "./create-prefilled-array"

test("0 elements", () => {
	const zeroElementArray = createPrefilledArray<string>(0, "")

	expect(zeroElementArray.length).toBe(0)
})

test("1000 elements", () => {
	const thousandElementArray = createPrefilledArray<number>(1000, 42)

	const allValuesArePrefilled = !thousandElementArray.some((value) => value !== 42)

	expect(thousandElementArray.length).toBe(1000)
	expect(allValuesArePrefilled).toBe(true)
})
