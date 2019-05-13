const baseSongKeys = `
	id,
	title,
	suffix,
	year,
	bpm,
	dateLastEdit,
	releaseDate,
	isRip,
	artists,
	remixer,
	featurings,
	type,
	genres,
	label,
	file{container, blob, fileExtension,originalFilename},
	duration,
	tags
`;

export const songKeys = `
	${baseSongKeys},
	requiresUserAction
`;

export const playlistSongKeys = `
	${baseSongKeys},
	playlistID,
	position,
	dateAdded
`