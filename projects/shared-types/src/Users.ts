import { UserStatus } from "./GeneratedTypes"

interface IUser {
	id: string
	name: string
	email: string
}

export interface IViewer extends IUser {
	shares: string[]
}

export interface IShareMember extends IUser {
	dateJoined: string
	shareID: string
	permissions: string[]
	status: UserStatus
}
