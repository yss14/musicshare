import { IUserService, UserNotFoundError, IInviteToShareReturnType } from "../../services/UserService"
import { User } from "../../models/UserModel"

export class UserServiceMock implements IUserService {
	constructor(private readonly users: User[]) {}

	public async getUserByID(id: string) {
		const user = this.users.find((user) => user.id === id)

		if (!user) {
			throw new UserNotFoundError("id", id)
		}

		return user
	}

	public async getUserByEMail(): Promise<User> {
		throw "Not implemented yet"
	}

	public async create(): Promise<User> {
		throw "Not implemented yet"
	}

	public async getAll(): Promise<User[]> {
		throw "Not implemented yet"
	}

	public async getUsersOfShare(): Promise<User[]> {
		throw "Not implemented yet"
	}

	public async inviteToShare(): Promise<IInviteToShareReturnType> {
		throw "Not implemented yet"
	}

	public async acceptInvitation(): Promise<User> {
		throw "Not implemented yet"
	}

	public async revokeInvitation(): Promise<void> {
		throw "Not implemented yet"
	}
}
