import { updateUserEmail } from "./email-resolver"
import { updateVisibilityFilter } from "./visibility-resolver"
import { updateShareId } from "./share-resolver"
import { playerStateResolvers } from "../../../components/player/player-state"

export const resolvers = {
	Mutation: {
		updateUserEmail,
		updateShareId,
		updateVisibilityFilter,
		...playerStateResolvers.Mutation,
	},
}
