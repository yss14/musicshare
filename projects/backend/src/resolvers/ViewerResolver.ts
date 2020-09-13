import { Viewer } from "../models/UserModel"
import { Resolver, Arg, Query, FieldResolver, Root, Mutation, Authorized, Ctx, Args } from "type-graphql"
import { Share } from "../models/ShareModel"
import { UserNotFoundError } from "../services/UserService"
import { LoginNotFound, CredentialsInvalid } from "../auth/PasswordLoginService"
import { InternalServerError } from "../types/internal-server-error"
import { IGraphQLContext, IShareScope } from "../types/context"
import { AuthTokenBundle } from "../models/AuthTokenBundleModel"
import { JsonWebTokenError } from "jsonwebtoken"
import { IServices } from "../services/services"
import { Artist } from "../models/ArtistModel"
import { Genre } from "../models/GenreModel"
import { SongType } from "../models/SongType"
import { ShareSong } from "../models/SongModel"
import { SongSearchInput, SongSearchMatcher } from "../inputs/SongSearchInput"
import { ChangePasswordInput } from "../inputs/ChangePasswordInput"
import { RestorePasswordInput } from "../inputs/RestorePasswordInput"
import { IConfig } from "../types/config"
import { FindNearDuplicatesInput } from "../args/duplicate-threshould"
import { RegistrationSuccess } from "../models/return-models/RegistrationSuccess"
import { RegistrationInput } from "../inputs/RegistrationInput"

@Resolver(() => Viewer)
export class ViewerResolver {
	constructor(private readonly services: IServices, private readonly config: IConfig) {}

	@Authorized()
	@Query(() => Viewer, { nullable: true })
	public viewer(@Ctx() ctx: IGraphQLContext): Promise<Viewer | null> {
		return this.services.userService.getUserByID(ctx.userID!)
	}

	@Authorized()
	@FieldResolver()
	public shares(@Root() user: Viewer, @Arg("libOnly", { nullable: true }) libOnly?: boolean): Promise<Share[]> {
		if (libOnly) {
			return this.services.shareService
				.getSharesOfUser(user.id)
				.then((shares) => shares.filter((share) => share.isLibrary))
		} else {
			return this.services.shareService.getSharesOfUser(user.id)
		}
	}

	@Mutation(() => AuthTokenBundle)
	public async login(
		@Arg("email") email: string,
		@Arg("password", { description: "Plain text, hashing takes place at server side" }) password: string,
	): Promise<AuthTokenBundle> {
		const { passwordLoginService, authService, userService } = this.services

		try {
			const refreshToken = await passwordLoginService.login(email, password)
			const refreshTokenDecoded = await authService.verifyToken(refreshToken)
			const user = await userService.getUserByEMail(email)

			const shareScopes = await this.getUserShareScopes(user.id)
			const authToken = await authService.issueAuthToken(user, shareScopes, refreshTokenDecoded.tokenID)

			return AuthTokenBundle.create(refreshToken, authToken)
		} catch (err) {
			if (err instanceof LoginNotFound || err instanceof CredentialsInvalid) {
				throw new CredentialsInvalid()
			} else {
				throw new InternalServerError(err)
			}
		}
	}

	@Mutation(() => Boolean)
	@Authorized()
	public async changePassword(
		@Arg("input") { oldPassword, newPassword }: ChangePasswordInput,
		@Ctx() { userID }: IGraphQLContext,
	): Promise<boolean> {
		await this.services.passwordLoginService.changePassword(userID!, oldPassword, newPassword)

		return true
	}

	@Mutation(() => String, { description: "Returns new restore token" })
	public async restorePassword(
		@Arg("input") { email, restoreToken, newPassword }: RestorePasswordInput,
	): Promise<string> {
		return await this.services.passwordLoginService.restorePassword(email, restoreToken, newPassword)
	}

	@Mutation(() => String, { description: "Issue a new authToken after the old one was invalidated" })
	public async issueAuthToken(@Arg("refreshToken") refreshToken: string): Promise<string> {
		const { authService, userService } = this.services

		try {
			const refreshTokenDecoded = await authService.verifyToken(refreshToken)
			const user = await userService.getUserByID(refreshTokenDecoded.userID)

			const shareScopes = await this.getUserShareScopes(user.id)
			const authToken = await authService.issueAuthToken(user, shareScopes, refreshTokenDecoded.tokenID)

			return authToken
		} catch (err) {
			if (err instanceof JsonWebTokenError) {
				throw new Error("Invalid AuthToken")
			} else if (err instanceof UserNotFoundError) {
				throw err
			} else {
				throw new InternalServerError(err)
			}
		}
	}

	private async getUserShareScopes(userID: string): Promise<IShareScope[]> {
		const { shareService, permissionService } = this.services

		const shares = await shareService.getSharesOfUser(userID)

		const userSharePermissions = await Promise.all(
			shares.map((share) => permissionService.getPermissionsForUser(share.id, userID)),
		)
		const shareScopes = userSharePermissions.map(
			(permissions, idx): IShareScope => {
				const share = shares[idx]

				return { shareID: share.id, permissions }
			},
		)

		return shareScopes
	}

	@Authorized()
	@FieldResolver(() => [Artist])
	public async artists(@Root() user: Viewer): Promise<Artist[]> {
		return this.services.artistService.getAggregatedArtistsForUser(user.id)
	}

	@Authorized()
	@FieldResolver(() => [Genre])
	public async genres(@Root() user: Viewer): Promise<Genre[]> {
		return this.services.genreService.getAggregatedGenresForUser(user.id)
	}

	@Authorized()
	@FieldResolver(() => [SongType])
	public async songTypes(@Root() user: Viewer): Promise<SongType[]> {
		return this.services.songTypeService.getAggregatedSongTypesForUser(user.id)
	}

	@Authorized()
	@FieldResolver(() => [String])
	public async tags(@Root() user: Viewer): Promise<string[]> {
		return this.services.tagService.getAggregatedTagsForUser(user.id)
	}

	@Authorized()
	@FieldResolver(() => [ShareSong])
	public async searchSongs(
		@Root() user: Viewer,
		@Args() { query, matcher, limit }: SongSearchInput,
	): Promise<ShareSong[]> {
		return this.services.songService.searchSongs(user.id, query, matcher || Object.values(SongSearchMatcher), limit)
	}

	@Authorized()
	@FieldResolver(() => [ShareSong])
	public async findSongFileDuplicates(@Root() user: Viewer, @Arg("hash") hash: string): Promise<ShareSong[]> {
		const songs = await this.services.songService.findSongFileDuplicates(user.id, hash)

		return songs
	}

	@Authorized()
	@FieldResolver(() => [ShareSong])
	public async findNearDuplicateSongs(
		@Root() user: Viewer,
		@Args() { title, artist, threshold }: FindNearDuplicatesInput,
	): Promise<ShareSong[]> {
		const songs = await this.services.songService.findNearDuplicateSongs(
			user.id,
			title,
			artist,
			threshold || this.config.setup.duplicateDetection.nearDuplicatesThreshould,
		)

		return songs
	}

	@Mutation(() => RegistrationSuccess)
	public async register(
		@Args() { email, name, password, captchaID, captchaSolution }: RegistrationInput,
	): Promise<RegistrationSuccess> {
		const captchaIsValid = await this.services.captchaService.checkCaptcha(captchaID, captchaSolution)

		if (!captchaIsValid) {
			throw new Error("Invalid Captcha")
		}

		await this.services.captchaService.invalidateCaptcha(captchaID)

		const user = await this.services.userService.create(name, email)
		await this.services.shareService.create(user.id, `${name}'s Library`, true)
		const restoreToken = await this.services.passwordLoginService.register({ userID: user.id, password })

		return {
			restoreToken,
			user,
		}
	}
}
