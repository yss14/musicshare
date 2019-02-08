import { ShareService } from '../services/share.service';
import { User } from '../models/user.model';
import { Resolver, Arg, Query, FieldResolver, Root } from "type-graphql";
import { plainToClass } from "class-transformer";
import { Share } from '../models/share.model';
import { UserService } from '../services/user.service';

@Resolver(of => User)
export class UserResolver {

	constructor(
		private readonly userService: UserService,
		private readonly shareService: ShareService
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