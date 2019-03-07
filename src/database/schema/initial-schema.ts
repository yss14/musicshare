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

export interface ISongByShareDBInsert {
	title: string;
	suffix?: string | null;
	year?: number | null;
	bpm?: number | null;
	date_last_edit: Date;
	release_date?: CTypes.LocalDate | null;
	is_rip: boolean;
	artists?: string[];
	remixer?: string[];
	featurings?: string[];
	type?: string | null;
	genres?: string[];
	label?: string | null;
	share_id: CTypes.TimeUuid;
	requires_user_action: boolean;
	file: string;
}

export interface ISongByShareDBResult extends ISongByShareDBInsert {
	id: CTypes.TimeUuid,
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
		type varchar,
		genres set<varchar>,
		label varchar,
		share_id timeuuid,
		requires_user_action boolean,
		file varchar,

        PRIMARY KEY (share_id, id)
    );
`;