export const users = () => `
	CREATE TABLE users (
		id timeuuid,
		name varchar,
		emails set<varchar>,
		date_added timestamp,

		PRIMARY KEY (id)
	);
`;

export const sharesByUser = () => `
	CREATE TABLE shares_by_user (
		id timeuuid,
		name varchar,
		user_id timeuuid,

		PRIMARY KEY(id, user_id)
	);
`;

export const songsByShare = () => `
    CREATE TABLE songs_by_share (
        id ascii,
        title varchar,
        suffix varchar,
        year int,
        bpm smallint,
        date_added timestamp,
        date_last_edit timestamp,
        release_date date,
        is_rip boolean,
        artists set<varchar>,
        share_id bigint,

        PRIMARY KEY (id, share_id)
    );
`;