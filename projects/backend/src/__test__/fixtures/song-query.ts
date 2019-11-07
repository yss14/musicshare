export const songKeysFileSources = (subqueries: string[]) => `
	sources {
		__typename
		${subqueries.join('\n')}
	}
`

export const songKeysFileSourceUpload = (props?: string) => `
	... on FileUpload{
		container
		blob
		fileExtension
		originalFilename
		${props || ''}
	}
`

export const songKeys = `
	id
	title
	suffix
	year
	bpm
	dateLastEdit
	releaseDate
	isRip
	artists
	remixer
	featurings
	type
	genres
	labels
	duration
	tags
	dateAdded
	libraryID
`;
