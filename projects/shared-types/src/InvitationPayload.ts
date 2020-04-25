export interface IInvitationPayload {
	shareID: string
	inviterID: string
	email: string
	invitationToken: string
}

export const isInvitationPayload = (obj: any): obj is IInvitationPayload => {
	return (
		typeof obj === "object" &&
		typeof obj.shareID === "string" &&
		typeof obj.inviterID === "string" &&
		typeof obj.email === "string" &&
		typeof obj.invitationToken === "string"
	)
}
