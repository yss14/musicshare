import { types as CTypes } from 'cassandra-driver';

export interface IUserDBResult {
	id: CTypes.TimeUuid;
	name: string;
	emails: string[];
}

export const users = () => `
	CREATE TABLE users (
		id timeuuid,
		name varchar,
		emails set<varchar>,

		PRIMARY KEY (id)
	);
`;

export interface IShareByUserDBResult {
	id: CTypes.TimeUuid;
	name: string;
	user_id: CTypes.TimeUuid;
	is_library: boolean;
}

export const sharesByUser = () => `
	CREATE TABLE shares_by_user (
		id timeuuid,
		name varchar,
		user_id timeuuid,
		is_library boolean,

		PRIMARY KEY(user_id, id)
	);
`;

export interface ISongByShareDBResult {
	id: CTypes.TimeUuid,
	title: string;
	suffix: string;
	year: number;
	bpm: number;
	date_last_edit: number;
	release_date: Date;
	is_rip: boolean;
	artists: string[];
	remixer: string[];
	featurings: string[];
	share_id: CTypes.TimeUuid;
}

export const songsByShare = () => `
    CREATE TABLE songs_by_share (
        id timeuuid,
        title varchar,
        suffix varchar,
        year int,
        bpm smallint,
        date_last_edit timestamp,
        release_date date,
        is_rip boolean,
		artists set<varchar>,
		remixer set<varchar>,
		featurings set<varchar>,
        share_id timeuuid,

        PRIMARY KEY (share_id, id)
    );
`;