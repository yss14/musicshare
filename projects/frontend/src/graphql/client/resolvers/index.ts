import { playerStateResolvers } from "../../../components/player/player-state"

export const resolvers = {
	Mutation: {
		...playerStateResolvers.Mutation,
	},
}
