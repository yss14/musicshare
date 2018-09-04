import * as ID3Parser from 'id3-parser';
import urlRegex = require('url-regex');
import { songTypes, genres } from '../database/fixtures';
import * as _ from 'lodash';
import { tryParseInt } from './try-parser';
const similarity = require('similarity');

export interface IExtractedSongMeta {
	title?: string;
	suffix?: string;
	year?: number;
	bpm?: number;
	releaseDate?: number;
	isRip?: boolean;
	artists?: Set<string>;
	remixer?: Set<string>;
	featurings?: Set<string>;
	type?: string;
	genre?: string;
	label?: string;
}

type ArtistType = 'artists' | 'remixer' | 'featurings';

interface IArtist {
	type: ArtistType;
	name: string;
}

export class SongMeta {
	public static async analyse(originalFilename: string, extension: string, audioBuffer: Buffer): Promise<IExtractedSongMeta> {
		const songMeta: IExtractedSongMeta = {
			title: null,
			suffix: null,
			year: null,
			bpm: null,
			releaseDate: null,
			isRip: false,
			artists: new Set(),
			remixer: new Set(),
			featurings: new Set(),
			type: null,
			genre: null,
			label: null
		};

		if (extension === 'mp3') {
			await this.analyseID3(audioBuffer, songMeta);
		}

		return songMeta;
	}

	private static async analyseID3(audioBuffer: Buffer, meta: IExtractedSongMeta): Promise<void> {
		const id3Tags = ID3Parser.parse(audioBuffer);

		if (id3Tags === false) {
			return;
		}

		// parse title
		let _title = '';

		if (id3Tags.hasOwnProperty('title') && id3Tags.title.trim().length > 0) {
			//Free up title from urls
			_title = this.removeUrlClutter(id3Tags.title).replace(/\0/g, '');
		} else {
			_title = this.removeUrlClutter(id3Tags.filename).replace(/\0/g, '');
		}

		_title = _title.replace(/\(\d+\)/g, '');

		//Try to find song type in title
		songTypes.forEach(type => {
			if (_title.indexOf('-') > -1) {
				let splitted = _title.split('-');

				const _artists: IArtist[] = _.flattenDeep(this.extractArtistRec(splitted[0], 'artists'));

				_artists.forEach(art => {
					meta[art.type].add(art.name);
				});

				_title = splitted[1];
			}

			let matchedType = "";

			if (_title.toLowerCase().indexOf(type.name.toLowerCase()) > -1 || (() => {
				if (type.hasOwnProperty('alternatives')) {
					let found = false;
					type.alternativeNames.forEach(alter => {
						if (_title.toLowerCase().indexOf(alter.toLowerCase()) > -1) {
							found = true;
							matchedType = alter;
						}
					});
					return found;
				}

				return false;
			})()) {
				meta.type = type.name;

				if (matchedType === "") {
					matchedType = type.name;
				}

				if (type.hasArtists) {
					//Extract corresponding artists
					const idxTypeBegin = _title.toLowerCase().indexOf(matchedType.toLowerCase());

					const idxTypeDelimiterEnd = idxTypeBegin + matchedType.length;
					let typeDelimiterChar = '';

					if (idxTypeDelimiterEnd < _title.length) {
						typeDelimiterChar = _title.charAt(idxTypeDelimiterEnd);
						typeDelimiterChar = typeDelimiterChar === ')' ? '(' : '[';
					}

					let idxArtistBegin = -1;

					if (typeDelimiterChar === '') {
						idxArtistBegin = this.indexOfCharLeft(_title, '(', idxTypeBegin - 1) ? this.indexOfCharLeft(_title, '(', idxTypeBegin - 1) :
							(this.indexOfCharLeft(_title, '[', idxTypeBegin - 1) > -1 ? this.indexOfCharLeft(_title, '[', idxTypeBegin - 1) : -1); 9
					} else {
						idxArtistBegin = this.indexOfCharLeft(_title, typeDelimiterChar, idxTypeBegin - 1);
					}

					if (idxTypeBegin !== -1 && idxArtistBegin !== -1) {
						const _artistStr = _title.substr(idxArtistBegin + 1, idxTypeBegin - idxArtistBegin - 1);

						_title = _title.substr(0, idxArtistBegin);

						const _artists: IArtist[] = _.flattenDeep(this.extractArtistRec(_artistStr, 'remixer'));

						_artists.forEach(art => {
							meta[art.type].add(art.name);
						});
					}
				}

				_title = _title.split(type.name).join('').replace('()', '');

				let featuringIdx = -1;

				if (_title.indexOf('feat.') > -1) {
					featuringIdx = _title.indexOf('feat.');
				} else if (_title.indexOf('ft.') > -1) {
					featuringIdx = _title.indexOf('ft.');
				}

				if (featuringIdx > -1) {
					const _artistStr = _title.substr(featuringIdx, _title.length - featuringIdx);

					const _artists: IArtist[] = _.flattenDeep(this.extractArtistRec(_artistStr, 'featurings'));

					_artists.forEach(art => {
						meta[art.type].add(art.name);
					});

					_title = _title.substr(0, featuringIdx - 1);
				}
			}
		});

		meta.title = _title.trim();


		//Parse artists
		if (id3Tags.hasOwnProperty('artist')) {
			const _artists: IArtist[] = _.flattenDeep(this.extractArtistRec(id3Tags.artist, 'artists'));

			_artists.forEach(art => {
				meta[art.type].add(art.name);
			});
		}

		//Parse year
		if (id3Tags.hasOwnProperty('year')) {
			meta.year = tryParseInt(id3Tags.year, null);
		} else {
			if (id3Tags.hasOwnProperty('release-time')) {
				const releaseTime = parseInt(id3Tags['release-time']);

				if (!isNaN(releaseTime)) {
					meta.year = releaseTime;
				}
			}
		}

		//Genre
		if (id3Tags.hasOwnProperty('genre')) {
			if (genres.indexOf(id3Tags.genre) > -1) {
				meta.genre = id3Tags.genre;
			} else {
				//Similarity test
				let bestScore = 0;
				let _genre = '';

				genres.forEach(genre => {
					const sim = similarity(id3Tags.genre, genre)
					if (sim > bestScore) {
						bestScore = sim;
						_genre = genre;
					}
				});

				if (bestScore >= 0.6) {
					meta.genre = _genre;
				}
			}
		}

		//BPM
		if (id3Tags.hasOwnProperty('bpm')) {
			meta.bpm = tryParseInt(id3Tags.bpm, null);
		}

		//Release date
		if (id3Tags.hasOwnProperty('release-time')) {
			meta.releaseDate = new Date(id3Tags['release-time']).getTime();
		}

		//Label
		if (id3Tags.hasOwnProperty('publisher')) {
			meta.label = this.removeUrlClutter(id3Tags.publisher);
		}

	}

	private static removeUrlClutter(input: string): string {
		const urls = input.match(urlRegex({ strict: false }));

		if (urls) {
			urls.forEach(url => {
				input = input.split(url).join('');
			});
		}

		return input.replace('()', '').replace('[]', '');
	}

	private static extractArtistRec(artStr: string, artType: 'artists' | 'featurings' | 'remixer'): any {
		if (artStr.indexOf('vs.') > -1) {
			let splitted = artStr.split('vs.');
			return splitted.map(splt => this.extractArtistRec(splt, artType));
		} else if (artStr.indexOf('&') > -1) {
			let splitted = artStr.split('&');
			return splitted.map(splt => this.extractArtistRec(splt, artType));
		} else if (artStr.indexOf(',') > -1) {
			let splitted = artStr.split(',');
			return splitted.map(splt => this.extractArtistRec(splt, artType));
		} else if (artStr.indexOf(' and ') > -1) {
			let splitted = artStr.split(' and ');
			return splitted.map(splt => this.extractArtistRec(splt, artType));
		} else if (artStr.indexOf(' x ') > -1) {
			let splitted = artStr.split(' x ');
			return splitted.map(splt => this.extractArtistRec(splt, artType));
		} else if (artStr.indexOf('feat.') > -1) {
			let splitted = artStr.split('feat.');
			return splitted.map((splt, idx) => this.extractArtistRec(splt, idx === 0 ? artType : 'featurings'));
		} else if (artStr.indexOf('ft.') > -1) {
			let splitted = artStr.split('ft.');
			return splitted.map((splt, idx) => this.extractArtistRec(splt, idx === 0 ? artType : 'featurings'));
		} else {
			const artName = artStr.trim().replace(/\0/g, '').split('(').join('').split(')').join('').split('[').join('').split(']').join('');

			if (artName.length === 0) return [];

			return [{
				name: artName,
				type: artType
			}]
		}
	}

	private static indexOfCharLeft(str: string, needle: string, fromIdx: number) {
		for (let i = fromIdx; i >= 0; i--) {
			if (str.charAt(i) === needle) {
				return i;
			}
		}

		return -1;
	}

	private static indexOfCharRight(str: string, needle: string, fromIdx: number) {
		for (let i = fromIdx; i < str.length; i++) {
			if (str.charAt(i) === needle) {
				return i;
			}
		}

		return -1;
	}
}