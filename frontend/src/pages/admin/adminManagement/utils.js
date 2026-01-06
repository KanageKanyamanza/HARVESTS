// Utilitaires pour AdminManagement

export const getRoleColor = (role) => {
	const colors = {
		"super-admin": "bg-rose-50 text-rose-600 border-rose-100",
		admin: "bg-blue-50 text-blue-600 border-blue-100",
		moderator: "bg-emerald-50 text-emerald-600 border-emerald-100",
		support: "bg-amber-50 text-amber-600 border-amber-100",
	};
	return colors[role] || "bg-gray-50 text-gray-600 border-gray-100";
};

export const getRoleLabel = (role) => {
	const labels = {
		"super-admin": "Super Admin",
		admin: "Admin",
		moderator: "Modérateur",
		support: "Support",
	};
	return labels[role] || role;
};

export const getDepartmentLabel = (department) => {
	const labels = {
		technical: "Technique",
		support: "Support",
		marketing: "Marketing",
		finance: "Finance",
		operations: "Opérations",
	};
	return labels[department] || department || "Non défini";
};

export const formatDate = (dateString) => {
	if (!dateString) return "Jamais";
	return new Date(dateString).toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};
