import { User } from './../models/user.model';
import { Resolver, ResolverInterface, Arg, Query } from "type-graphql";
import { plainToClass } from "class-transformer";

@Resolver(User)
export class UserResolver {
	@Query(returns => User, { nullable: true })
	public user(@Arg("id") id: string): Promise<User | undefined> {
		return Promise.resolve(
			plainToClass(User, {
				id: '1234',
				name: 'Some name',
				emails: new Set(['some@email.com']),
				dateAdded: new Date().getTime().toString()
			})
		);
	}
}