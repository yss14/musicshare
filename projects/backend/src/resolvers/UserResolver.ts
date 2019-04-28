import { IShareService } from '../services/ShareService';
import { User } from '../models/UserModel';
import { Resolver, Arg, Query, FieldResolver, Root, Mutation, Authorized } from "type-graphql";
import { Share } from '../models/ShareModel';
import { IUserService } from '../services/UserService';
import { IPasswordLoginService, LoginNotFound, LoginCredentialsInvalid } from '../auth/PasswordLoginService';
import { InternalServerError } from '../types/internal-server-error';

@Resolver(of => User)
export class UserResolver {

	constructor(
		private readonly userService: IUserService,
		private readonly shareService: IShareService,
		private readonly passwordLoginService: IPasswordLoginService,
	) { }

	@Authorized()
	@Query(returns => User, { nullable: true })
	public user(@Arg("id") id: string): Promise<User | null> {
		return this.userService.getUserByID(id);
	}

	@Authorized()
	@FieldResolver()
	public shares(
		@Root() user: User,
		@Arg('libOnly', { nullable: true }) libOnly?: boolean
	): Promise<Share[]> {
		if (libOnly) {
			return this.shareService.getSharesByUser(user)
				.then(shares => shares.filter(share => share.isLibrary));
		} else {
			return this.shareService.getSharesByUser(user);
		}
	}

	@Mutation(() => String)
	public async login(
		@Arg('email') email: string,
		@Arg('password', { description: 'Plain text, hashing takes place at server side' }) password: string,
	): Promise<string> {
		try {
			const authToken = await this.passwordLoginService.login(email, password);

			return authToken;
		} catch (err) {
			if (err instanceof LoginNotFound || err instanceof LoginCredentialsInvalid) {
				throw new LoginCredentialsInvalid();
			} else {
				throw new InternalServerError(err);
			}
		}
	}
}