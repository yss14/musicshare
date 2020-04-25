export const allMatchingOptions = ["Title", "Artists", "Tags", "Genres", "Labels"]

export type SearchMode = "search" | "filter" | "both"

export interface ISongSearchOptions {
	matcher: string[]
	mode: SearchMode
}

export interface ISongSearchFilter extends ISongSearchOptions {
	query: string
}
