import * as _ from 'lodash';

export type ArtistType = 'artists' | 'remixer' | 'featurings';

export interface IArtist {
	type: ArtistType;
	name: string;
	suffix?: string;
}

export class ArtistExtractor {
	public static readonly featuringSeparators = ['feat.', 'ft.', 'feat '];
	private readonly separators = ArtistExtractor.featuringSeparators
		.concat(['vs.', 'Vs.', 'VS.', ' vs ', 'Vs', 'VS', '&', ',', ' and ', ' And ', ' x ']);
	private readonly knownArtists: Set<string>;

	constructor(knownArtists: string[] | Set<string> = []) {
		if (knownArtists instanceof Set) {
			this.knownArtists = knownArtists;
		} else {
			this.knownArtists = new Set(knownArtists);
		}
	}

	public extract(artistStr: string, artistType: ArtistType): IArtist[] {
		const [cutArtists, newArtistStr] = this.cutKnownArtists(artistStr, artistType);

		for (const separator of this.separators) {
			if (newArtistStr.indexOf(separator) > -1) {
				const split = newArtistStr.split(separator);
				const featuringIndex = this.getFeaturingIndex(artistStr);

				const newArtistType = (artistSubstr: string): ArtistType => ArtistExtractor.featuringSeparators.includes(separator)
					&& artistStr.indexOf(artistSubstr) >= featuringIndex
					? 'featurings'
					: artistType;

				return cutArtists.concat(
					_.flatMap(split.map(splt => this.extract(splt, newArtistType(splt))))
				);
			}
		}

		const artName = newArtistStr.trim().replace(/\0/g, '').split('(').join('').split(')').join('').split('[').join('').split(']').join('');

		if (artName.length === 0) {
			return cutArtists;
		}

		if (artName.indexOf('\'s') > -1) {
			return cutArtists.concat([{
				name: artName.substr(0, artName.indexOf('\'s')),
				type: artistType,
				suffix: artName.substr(artName.indexOf('\'s'))
			}]);
		}

		return cutArtists.concat([{
			name: artName,
			type: artistType
		}]);
	}

	private cutKnownArtists(artistStr: string, artistType: ArtistType): [IArtist[], string] {
		let newArtistStr = artistStr;
		const cutArtists: IArtist[] = [];
		const featuringIndex = this.getFeaturingIndex(newArtistStr);

		for (const knownArtist of this.knownArtists) {
			const startIndex = newArtistStr.indexOf(knownArtist);

			if (startIndex > -1 && startIndex < featuringIndex) {
				const artistName = newArtistStr.substr(startIndex, knownArtist.length);
				const artist: IArtist = { name: artistName, type: artistType };

				newArtistStr = newArtistStr.substr(0, startIndex) + newArtistStr.substr(startIndex + knownArtist.length);

				if (!this.separators.some(separator => newArtistStr.indexOf(separator) > -1) && newArtistStr.trim().length > 0) {
					artist.suffix = newArtistStr.trim();
					newArtistStr = '';
				}

				cutArtists.push(artist);
			}
		}

		return [cutArtists, newArtistStr];
	}

	private getFeaturingIndex(artistStr: string) {
		for (const separator of ArtistExtractor.featuringSeparators) {
			const idx = artistStr.indexOf(separator);

			if (idx > -1) {
				return idx;
			}
		}

		return Number.MAX_SAFE_INTEGER;
	}
}