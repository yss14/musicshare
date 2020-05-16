import { IUserService, UserNotFoundError, IInviteToShareReturnType } from "../../services/UserService"
import { Viewer, ShareMember } from "../../models/UserModel"

export class UserServiceMock implements IUserService {
	constructor(private readonly users: Viewer[]) {}

	public async getUserByID(id: string) {
		const user = this.users.find((user) => user.id === id)

		if (!user) {
			throw new UserNotFoundError("id", id)
		}

		return user
	}

	public async getUserByEMail(): Promise<Viewer> {
		throw "Not implemented yet"
	}

	public async create(): Promise<Viewer> {
		throw "Not implemented yet"
	}

	public async getAll(): Promise<Viewer[]> {
		throw "Not implemented yet"
	}

	public async getMembersOfShare(): Promise<ShareMember[]> {
		throw "Not implemented yet"
	}

	public async inviteToShare(): Promise<IInviteToShareReturnType> {
		throw "Not implemented yet"
	}

	public async acceptInvitation(): Promise<Viewer> {
		throw "Not implemented yet"
	}

	public async revokeInvitation(): Promise<void> {
		throw "Not implemented yet"
	}
}
