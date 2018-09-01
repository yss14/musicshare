export const songsByShare = () => `
    CREATE TABLE songs_by_share(
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