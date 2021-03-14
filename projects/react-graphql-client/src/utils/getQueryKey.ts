import { DocumentNode, parse } from "graphql"

type GetQueryKey = {
	(query: string): string
	(query: DocumentNode): string
	(query: DocumentNode | string): string
}

export const getQueryKey: GetQueryKey = (query: DocumentNode | string): string => {
	const node = typeof query === "string" ? parse(query) : query
	return (node.definitions[0] as any).name.value
}
