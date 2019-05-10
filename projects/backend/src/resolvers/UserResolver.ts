import { IShareService } from '../services/ShareService';
import { User } from '../models/UserModel';
import { Resolver, Arg, Query, FieldResolver, Root, Mutation, Authorized, Ctx, Args } from "type-graphql";
import { Share } from '../models/ShareModel';
import { IUserService, UserNotFoundError } from '../services/UserService';
import { IPasswordLoginService, LoginNotFound, LoginCredentialsInvalid } from '../auth/PasswordLoginService';
import { InternalServerError } from '../types/internal-server-error';
import { IGraphQLContext, IShareScope } from '../types/context';
import { AuthTokenBundle } from '../models/AuthTokenBundleModel';
import { IAuthenticationService } from '../auth/AuthenticationService';
import { JsonWebTokenError } from 'jsonwebtoken';
import { UserIDArg, PermissionsArg } from '../args/user-args';
import { ShareIDArg } from '../args/share-args';
import { IPermissionService } from '../services/PermissionsService';
import { ShareAuth } from '../auth/middleware/share-auth';

@Resolver(of => User)
export class UserResolver {

	constructor(
		private readonly userService: IUserService,
		private readonly shareService: IShareService,
		private readonly passwordLoginService: IPasswordLoginService,
		private readonly authService: IAuthenticationService,
		private readonly permissionService: IPermissionService,
	) { }

	@Authorized()
	@Query(returns => User, { nullable: true })
	public user(
		@Ctx() ctx: IGraphQLContext,
	): Promise<User | null> {
		return this.userService.getUserByID(ctx.userID!);
	}

	@Authorized()
	@FieldResolver()
	public shares(
		@Root() user: User,
		@Arg('libOnly', { nullable: true }) libOnly?: boolean
	): Promise<Share[]> {
		if (libOnly) {
			return this.shareService.getSharesByUser(user.id)
				.then(shares => shares.filter(share => share.isLibrary));
		} else {
			return this.shareService.getSharesByUser(user.id);
		}
	}

	@Mutation(() => AuthTokenBundle)
	public async login(
		@Arg('email') email: string,
		@Arg('password', { description: 'Plain text, hashing takes place at server side' }) password: string,
	): Promise<AuthTokenBundle> {
		try {
			const refreshToken = await this.passwordLoginService.login(email, password);
			const refreshTokenDecoded = await this.authService.verifyToken(refreshToken);
			const user = await this.userService.getUserByEMail(email);

			const shareScopes = await this.getUserShareScopes(user.id);
			const authToken = await this.authService.issueAuthToken(user, shareScopes, refreshTokenDecoded.tokenID);

			return AuthTokenBundle.create(refreshToken, authToken);
		} catch (err) {
			if (err instanceof LoginNotFound || err instanceof LoginCredentialsInvalid) {
				throw new LoginCredentialsInvalid();
			} else {
				throw new InternalServerError(err);
			}
		}
	}

	@Mutation(() => String, { description: 'Issue a new authToken after the old one was invalidated' })
	public async issueAuthToken(
		@Arg('refreshToken') refreshToken: string,
	): Promise<string> {
		try {
			const refreshTokenDecoded = await this.authService.verifyToken(refreshToken);
			const user = await this.userService.getUserByID(refreshTokenDecoded.userID);

			const shareScopes = await this.getUserShareScopes(user.id);
			const authToken = await this.authService.issueAuthToken(user, shareScopes, refreshTokenDecoded.tokenID);

			return authToken;
		} catch (err) {
			if (err instanceof JsonWebTokenError) {
				throw new Error('Invalid AuthToken');
			} else if (err instanceof UserNotFoundError) {
				throw err;
			} else {
				throw new InternalServerError(err);
			}
		}
	}

	private async getUserShareScopes(userID: string): Promise<IShareScope[]> {
		const shares = await this.shareService.getSharesByUser(userID);

		const userSharePermissions = await Promise.all(
			shares.map(share => this.permissionService.getPermissionsForUser(share.id, userID))
		);
		const shareScopes = userSharePermissions.map((permissions, idx): IShareScope => {
			const share = shares[idx];

			return { shareID: share.id, permissions };
		});

		return shareScopes;
	}

	@Authorized()
	@ShareAuth({ permissions: ['share:members'] })
	@Mutation(() => [String], { description: 'Adds permissions to a user and returns the updated permission list' })
	public async updateUserPermissions(
		@Args() { userID }: UserIDArg,
		@Args() { shareID }: ShareIDArg,
		@Args() { permissions }: PermissionsArg,
	): Promise<string[]> {
		await this.permissionService.addPermissionsForUser(shareID, userID, permissions);

		return this.permissionService.getPermissionsForUser(shareID, userID);
	}
}