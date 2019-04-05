import { ISongType } from "../models/interfaces/SongType";
import { IGenre } from "../models/interfaces/Genre";

export const defaultSongTypes: ISongType[] = [
	{ name: 'Acapella', hasArtists: false, group: 'Electronic Music' },
	{ name: 'Radio Edit', hasArtists: false, group: 'Electronic Music' },
	{ name: 'Bootleg', hasArtists: true, group: 'Electronic Music' },
	{ name: 'Club Mix', hasArtists: true, group: 'Electronic Music' },
	{ name: 'Edit', hasArtists: true, group: 'Electronic Music' },
	{ name: 'Extended Mix', hasArtists: true, group: 'Electronic Music' },
	{ name: 'Instrumental Mix', hasArtists: true, alternativeNames: ['Instrumental'], group: 'Electronic Music' },
	{ name: 'MashUp', hasArtists: true, group: 'Electronic Music' },
	{ name: 'Original Mix', hasArtists: false, group: 'Electronic Music' },
	{ name: 'Remake', hasArtists: true, group: 'Electronic Music' },
	{ name: 'Vocal Mix', hasArtists: false, group: 'Electronic Music' },
	{ name: 'Remix', hasArtists: true, alternativeNames: ['Mix', 'Extended Remix'], group: 'Electronic Music' },
];

export const defaultGenres: IGenre[] = [
	'Big Room', 'Chillstep', 'Dance', 'Deep House', 'Drum & Bass', 'Dubstep',
	'Electro House', 'Electronica', 'Future Bass', 'Future House', 'Hard Techno', 'Hardstyle', 'House',
	'Indie Dance', 'Minimal', 'Progressive House', 'Progressive Trance', 'Psy Trance', 'Tech House', 'Techno',
	'Trance', 'Trap', 'Pop'
].map(name => ({ name, group: 'Electronic Music' }));