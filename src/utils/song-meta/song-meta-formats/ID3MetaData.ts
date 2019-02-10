import * as ID3Parser from 'id3-parser';
import urlRegex = require('url-regex');
import { songTypes, genres } from '../../../database/fixtures';
import * as _ from 'lodash';
import { tryParseInt } from '../../try-parse/try-parse-int';
import { ISongMetaDataSource, ExtractedSongMetaData } from './ISongMetaDataSource';
import { IFile } from '../../../models/interfaces/IFile';
const similarity = require('similarity');

type ArtistType = 'artists' | 'remixer' | 'featurings';

interface IArtist {
	type: ArtistType;
	name: string;
}

export class ID3MetaData implements ISongMetaDataSource {
	public isApplicableForFile(file: IFile) {
		return file.fileExtension.toLowerCase() === 'mp3';
	}

	public async analyse(file: IFile, audioBuffer: Buffer): Promise<ExtractedSongMetaData> {
		const id3Tags = ID3Parser.parse(audioBuffer);
		const extractedMetaData: ExtractedSongMetaData = {
			artists: [],
			remixer: [],
			featurings: [],
			genres: []
		};

		if (id3Tags === false) {
			return extractedMetaData;
		}

		try {
			// parse title
			let _title = '';

			if (id3Tags.title !== undefined && id3Tags.title.trim().length > 0) {
				//Free up title from urls
				_title = this.removeUrlClutter(id3Tags.title).replace(/\0/g, '');
			} else {
				if (id3Tags.hasOwnProperty('filename')) {
					_title = this.removeUrlClutter(id3Tags.filename).replace(/\0/g, '');
				} else {
					_title = this.removeUrlClutter(file.originalFilename).replace(/\0/g, '');
				}
			}

			_title = _title.replace(/\(\d+\)/g, '');

			//Try to find song type in title
			songTypes.forEach(type => {
				if (_title.indexOf('-') > -1) {
					let splitted = _title.split('-');

					const _artists: IArtist[] = _.flattenDeep(this.extractArtistRec(splitted[0], 'artists'));

					_artists.forEach(art => {
						if (extractedMetaData[art.type] instanceof Array) {
							extractedMetaData[art.type]!.push(art.name);
						}
					});

					_title = splitted[1];
				}

				let matchedType = "";

				if (_title.toLowerCase().indexOf(type.name.toLowerCase()) > -1 || (() => {
					if (type.alternativeNames !== undefined) {
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
					extractedMetaData.type = type.name;

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
								(this.indexOfCharLeft(_title, '[', idxTypeBegin - 1) > -1 ? this.indexOfCharLeft(_title, '[', idxTypeBegin - 1) : -1);
						} else {
							idxArtistBegin = this.indexOfCharLeft(_title, typeDelimiterChar, idxTypeBegin - 1);
						}

						if (idxTypeBegin !== -1 && idxArtistBegin !== -1) {
							const _artistStr = _title.substr(idxArtistBegin + 1, idxTypeBegin - idxArtistBegin - 1);

							_title = _title.substr(0, idxArtistBegin);

							const _artists: IArtist[] = _.flattenDeep(this.extractArtistRec(_artistStr, 'remixer'));

							_artists.forEach(art => {
								extractedMetaData[art.type]!.push(art.name);
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
							extractedMetaData[art.type]!.push(art.name);
						});

						_title = _title.substr(0, featuringIdx - 1);
					}
				}
			});

			extractedMetaData.title = _title.trim();

			//Parse artists
			if (id3Tags.artist !== undefined) {
				const _artists: IArtist[] = _.flattenDeep(this.extractArtistRec(id3Tags.artist, 'artists'));

				_artists.forEach(art => {
					extractedMetaData[art.type]!.push(art.name);
				});
			}

			//Parse year
			if (id3Tags.year !== undefined) {
				const parsedYear = tryParseInt(id3Tags.year, -1)
				extractedMetaData.year = parsedYear > 0 ? parsedYear : null;
			} else {
				if (id3Tags["release-time"]) {
					const releaseTime = parseInt(id3Tags['release-time']);

					if (!isNaN(releaseTime)) {
						extractedMetaData.year = releaseTime;
					}
				}
			}

			//Genre
			if (id3Tags.genre !== undefined) {
				if (genres.indexOf(id3Tags.genre) > -1) {
					extractedMetaData.genres!.push(id3Tags.genre);
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
						extractedMetaData.genres!.push(_genre);
					}
				}
			}

			//BPM
			if (id3Tags.bpm) {
				const parsedBPM = tryParseInt(id3Tags.bpm, -1);
				extractedMetaData.bpm = parsedBPM > 0 ? parsedBPM : null;
			}

			//Release date
			if (id3Tags["release-time"]) {
				extractedMetaData.releaseDate = new Date(id3Tags['release-time']).getTime().toString();
			}

			//Label
			if (id3Tags.publisher !== undefined) {
				extractedMetaData.label = this.removeUrlClutter(id3Tags.publisher);
			}
		} catch (err) {
			console.error(err);
		}

		return extractedMetaData;
	}

	private removeUrlClutter(input: string): string {
		const urls = input.match(urlRegex({ strict: false }));
		let output = input;

		if (urls) {
			urls.forEach(url => {
				output = output.split(url).join('');
			});
		}

		return output.replace('()', '').replace('[]', '');
	}

	private extractArtistRec(artStr: string, artType: 'artists' | 'featurings' | 'remixer'): any {
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

	private indexOfCharLeft(str: string, needle: string, fromIdx: number) {
		for (let i = fromIdx; i >= 0; i--) {
			if (str.charAt(i) === needle) {
				return i;
			}
		}

		return -1;
	}
}