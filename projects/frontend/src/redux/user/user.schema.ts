export interface IUserSchema {
	readonly id: string | null;
	readonly name: string | null;
	readonly authToken: string | null;
	readonly refreshToken: string | null;
}