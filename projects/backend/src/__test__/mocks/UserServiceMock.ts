import { IUserService, UserNotFoundError, IInviteToShareReturnType } from "../../services/UserService";
import { User } from "../../models/UserModel";

export class UserServiceMock implements IUserService {

	constructor(
		private readonly users: User[]
	) { }

	public async getUserByID(id: string) {
		const user = this.users.find(user => user.id === id);

		if (!user) {
			throw new UserNotFoundError('id', id);
		}

		return user;
	}

	public async getUserByEMail(email: string): Promise<User> {
		throw 'Not implemented yet';
	}

	public async create(name: string, email: string): Promise<User> {
		throw 'Not implemented yet';
	}

	public async getAll(): Promise<User[]> {
		throw 'Not implemented yet';
	}

	public async getUsersOfShare(shareID: string): Promise<User[]> {
		throw 'Not implemented yet';
	}

	public async inviteToShare(shareID: string, inviterID: string, email: string): Promise<IInviteToShareReturnType> {
		throw 'Not implemented yet';
	}

	public async acceptInvitation(invitationToken: string, name: string, password: string): Promise<User> {
		throw 'Not implemented yet';
	}

	public async revokeInvitation(userID: string): Promise<void> {
		throw 'Not implemented yet';
	}
}