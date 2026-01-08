import React from "react";

const NotificationPagination = ({
	currentPage,
	totalPages,
	total,
	onPageChange,
	isMobile = false,
}) => {
	if (totalPages <= 1) return null;

	if (isMobile) {
		return (
			<div className="md:hidden bg-white/50 border border-gray-100/50 backdrop-blur-sm rounded-2xl p-4 mt-4 shadow-sm">
				<div className="flex flex-col space-y-4">
					<div className="text-center text-xs font-bold text-gray-500 uppercase tracking-wide">
						Page {currentPage} / {totalPages} • {total} résultat
						{total > 1 ? "s" : ""}
					</div>
					<div className="flex items-center justify-between gap-3">
						<button
							onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
							disabled={currentPage === 1}
							className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white shadow-sm transition-all"
						>
							Précédent
						</button>
						<button
							onClick={() =>
								onPageChange(Math.min(currentPage + 1, totalPages))
							}
							disabled={currentPage === totalPages}
							className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 bg-white shadow-sm transition-all"
						>
							Suivant
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="hidden md:flex items-center justify-between px-2">
			<div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
				Affichage de{" "}
				<span className="text-gray-900">{(currentPage - 1) * 20 + 1}</span> à{" "}
				<span className="text-gray-900">
					{Math.min(currentPage * 20, total)}
				</span>{" "}
				sur <span className="text-gray-900">{total}</span> notifications
			</div>
			<div className="flex items-center space-x-2">
				<button
					onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
					disabled={currentPage === 1}
					className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-emerald-600 transition-all"
				>
					Précédent
				</button>
				<div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black">
					Page {currentPage} / {totalPages}
				</div>
				<button
					onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
					disabled={currentPage === totalPages}
					className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-emerald-600 transition-all"
				>
					Suivant
				</button>
			</div>
		</div>
	);
};

export default NotificationPagination;
