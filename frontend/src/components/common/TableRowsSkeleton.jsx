import React from "react";

/**
 * Lignes de tableau grisées : seules les lignes (données du serveur) attendent,
 * l'en-tête du tableau et les filtres restent affichés.
 */
const TableRowsSkeleton = ({ rows = 5, cols = 5 }) =>
	Array.from({ length: rows }, (_, r) => (
		<tr key={r} className="animate-pulse" aria-busy="true">
			{Array.from({ length: cols }, (_, c) => (
				<td key={c} className="px-4 py-4">
					<div className={`h-3 bg-gray-100 rounded ${c === 0 ? "w-3/4" : "w-1/2"}`} />
				</td>
			))}
		</tr>
	));

export default TableRowsSkeleton;
