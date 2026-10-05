import React from "react";

/**
 * Valeur venant du serveur : pendant le chargement, une barre grisée prend sa
 * place ; le libellé qui l'entoure (texte fixe) reste affiché normalement.
 */
const DataValue = ({ loading, children, className = "w-16 h-[0.9em]", light = false }) =>
	loading ?
		<span
			aria-busy="true"
			className={`inline-block align-middle rounded-md animate-pulse ${light ? "bg-white/30" : "bg-gray-200/80"} ${className}`}
		/>
	:	<>{children}</>;

export default DataValue;
