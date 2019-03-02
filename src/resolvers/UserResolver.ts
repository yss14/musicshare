import { IShareService } from '../services/ShareService';
import { User } from '../models/user.model';
import { Resolver, Arg, Query, FieldResolver, Root } from "type-graphql";
import { Share } from '../models/share.model';
import { IUserService } from '../services/UserService';
import { Inject } from 'typedi';

@Resolver(of => User)
export class UserResolver {

	constructor(
		@Inject('USER_SERVICE') private readonly userService: IUserService,
		@Inject('SHARE_SERVICE') private readonly shareService: IShareService
	) { }

	@Query(returns => User, { nullable: true })
	public user(@Arg("id") id: string): Promise<User | null> {
		return this.userService.getUserByID(id);
	}

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
}