export function topologicalSort<T, K>(values: Iterable<T>, key: (value: T) => K, edges: (value: T) => Iterable<K>): T[] | null {
	type Node = { dependency_of: Node[], references: 0, value: T };
	const nodes = new Map<K, Node>();
	for (const value of values) {
		nodes.set(key(value), { dependency_of: [], references: 0, value, });
	}
	for (const [, node] of nodes) {
		for (const foreignKey of edges(node.value)) {
			const target = nodes.get(foreignKey);
			if (!target) {
				continue; // ignore unknown keys
			}
			target.dependency_of.push(node);
			++node.references;
		}
	}
	const sorted: T[] = [];
	const pending = [...nodes.values()].filter(value => value.references === 0);
	for (; ;) {
		const node = pending.pop();
		if (!node) {
			break;
		}
		nodes.delete(key(node.value));
		sorted.push(node.value);
		for (const dependent of node.dependency_of) {
			if ((--dependent.references) === 0) {
				pending.push(dependent);
			}
		}
	}
	if (nodes.size !== 0) {
		return null;
	}

	return sorted;
}