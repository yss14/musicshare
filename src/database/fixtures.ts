export interface ISongType {
	name: string;
	hasArtists: boolean;
	alternativeNames?: string[];
}

export const songTypes: ISongType[] = [
	{ name: 'Acapella', hasArtists: false },
	{ name: 'Radio Edit', hasArtists: false },
	{ name: 'Bootleg', hasArtists: true },
	{ name: 'Club Mix', hasArtists: true },
	{ name: 'Edit', hasArtists: true },
	{ name: 'Extended Mix', hasArtists: false },
	{ name: 'Instrumental Mix', hasArtists: true, alternativeNames: ['Instrumental'] },
	{ name: 'MashUp', hasArtists: true },
	{ name: 'Original Mix', hasArtists: false },
	{ name: 'Remake', hasArtists: true },
	{ name: 'Vocal Mix', hasArtists: false },
	{ name: 'Remix', hasArtists: true, alternativeNames: ['Mix'] },
];

export const genres: string[] = ['Big Room', 'Chillstep', 'Dance', 'Deep House', 'Drum & Bass', 'Dubstep',
	'Electro House', 'Electronica', 'Future Bass', 'Future House', 'Hard Techno', 'Hardstyle', 'House',
	'Indie Dance', 'Minimal', 'Progressive House', 'Progressive Trance', 'Psy Trance', 'Tech House', 'Techno',
	'Trance', 'Trap', 'Pop'];