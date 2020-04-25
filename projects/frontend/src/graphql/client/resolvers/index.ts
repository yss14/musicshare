import { updateUserEmail } from "./email-resolver"
import { updateVisibilityFilter } from "./visibility-resolver"
import { updateShareId } from "./share-resolver"

export const resolvers = {
	Mutation: {
		updateUserEmail,
		updateShareId,
		updateVisibilityFilter,
	},
}
