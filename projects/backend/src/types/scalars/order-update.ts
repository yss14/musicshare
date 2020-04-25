import { GraphQLScalarType, Kind } from "graphql"
import { OrderUpdate } from "../../services/PlaylistService"

/* istanbul ignore file */

export const OrderUpdateScalar = new GraphQLScalarType({
	name: "OrderUpdate",
	description:
		"Alias for a length 2 array [string,number], which maps a songID into its new position within a collection",
	parseValue(value: number[]) {
		return value
	},
	serialize(value: OrderUpdate) {
		return value
	},
	parseLiteral(ast): OrderUpdate | null {
		if (ast.kind === Kind.LIST && ast.values.length === 2) {
			const firstValue = ast.values[0]
			const secondalue = ast.values[1]

			if (firstValue.kind === Kind.STRING && secondalue.kind === Kind.INT) {
				return [firstValue.value, parseInt(secondalue.value)]
			}
		}

		return null
	},
})
