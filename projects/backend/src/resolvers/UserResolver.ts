import { User } from '../models/UserModel';
import { Resolver, Arg, Query, FieldResolver, Root, Mutation, Authorized, Ctx, Args } from "type-graphql";
import { Share } from '../models/ShareModel';
import { UserNotFoundError } from '../services/UserService';
import { LoginNotFound, LoginCredentialsInvalid } from '../auth/PasswordLoginService';
import { InternalServerError } from '../types/internal-server-error';
import { IGraphQLContext, IShareScope } from '../types/context';
import { AuthTokenBundle } from '../models/AuthTokenBundleModel';
import { JsonWebTokenError } from 'jsonwebtoken';
import { UserIDArg, PermissionsArg } from '../args/user-args';
import { ShareIDArg } from '../args/share-args';
import { ShareAuth } from '../auth/middleware/share-auth';
import { IServices } from '../services/services';

@Resolver(of => User)
export class UserResolver {

	constructor(
		private readonly services: IServices,
	) { }

	@Authorized()
	@Query(returns => User, { nullable: true })
	public viewer(
		@Ctx() ctx: IGraphQLContext,
	): Promise<User | null> {
		return this.services.userService.getUserByID(ctx.userID!);
	}

	@Authorized()
	@FieldResolver()
	public shares(
		@Root() user: User,
		@Arg('libOnly', { nullable: true }) libOnly?: boolean
	): Promise<Share[]> {
		if (libOnly) {
			return this.services.shareService.getSharesOfUser(user.id)
				.then(shares => shares.filter(share => share.isLibrary));
		} else {
			return this.services.shareService.getSharesOfUser(user.id);
		}
	}

	@Mutation(() => AuthTokenBundle)
	public async login(
		@Arg('email') email: string,
		@Arg('password', { description: 'Plain text, hashing takes place at server side' }) password: string,
	): Promise<AuthTokenBundle> {
		const { passwordLoginService, authService, userService } = this.services;

		try {
			const refreshToken = await passwordLoginService.login(email, password);
			const refreshTokenDecoded = await authService.verifyToken(refreshToken);
			const user = await userService.getUserByEMail(email);

			const shareScopes = await this.getUserShareScopes(user.id);
			const authToken = await authService.issueAuthToken(user, shareScopes, refreshTokenDecoded.tokenID);

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
		const { authService, userService } = this.services;

		try {
			const refreshTokenDecoded = await authService.verifyToken(refreshToken);
			const user = await userService.getUserByID(refreshTokenDecoded.userID);

			const shareScopes = await this.getUserShareScopes(user.id);
			const authToken = await authService.issueAuthToken(user, shareScopes, refreshTokenDecoded.tokenID);

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
		const { shareService, permissionService } = this.services;

		const shares = await shareService.getSharesOfUser(userID);

		const userSharePermissions = await Promise.all(
			shares.map(share => permissionService.getPermissionsForUser(share.id, userID))
		);
		const shareScopes = userSharePermissions.map((permissions, idx): IShareScope => {
			const share = shares[idx];

			return { shareID: share.id, permissions };
		});

		return shareScopes;
	}

	@Authorized()
	@ShareAuth({ permissions: ['share:members'] })
	@Mutation(() => [String], { description: 'Updates permissions of a user and returns the updated permission list' })
	public async updateUserPermissions(
		@Args() { userID }: UserIDArg,
		@Args() { shareID }: ShareIDArg,
		@Args() { permissions }: PermissionsArg,
	): Promise<string[]> {
		await this.services.permissionService.addPermissionsForUser(shareID, userID, permissions);

		return this.services.permissionService.getPermissionsForUser(shareID, userID);
	}
}