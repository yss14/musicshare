import { IUserService, UserNotFoundError } from "../../services/UserService";
import { User } from "../../models/user.model";

export class UserServiceMock implements IUserService {

	constructor(
		private readonly users: User[]
	) { }

	public async getUserByID(id: string) {
		const user = this.users.find(user => user.id === id);

		if (!user) {
			throw new UserNotFoundError(id);
		}

		return user;
	}
}