export interface IUserSchema {
	readonly id: string;
	readonly name: string;
	readonly authToken: string;
	readonly refreshToken: string;
}