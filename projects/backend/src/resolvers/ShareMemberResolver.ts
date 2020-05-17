import { Resolver } from "type-graphql"
import { ShareMember } from "../models/UserModel"
import { IServices } from "../services/services"

@Resolver(() => ShareMember)
export class ShareMemberResolver {
	constructor(private readonly services: IServices) {}
}
