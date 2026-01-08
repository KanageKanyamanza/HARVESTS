import React from "react";

const SubscriptionPagination = ({
	currentPage,
	totalPages,
	totalItems,
	onPageChange,
}) => {
	if (totalPages <= 1) return null;

	return (
		<div className="backdrop-blur-xl bg-white/80 border border-white/20 shadow-xl rounded-2xl px-4 py-3 flex items-center justify-between mt-6 sm:px-6">
			<div className="flex-1 flex justify-between sm:hidden">
				<button
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage === 1}
					className="relative inline-flex items-center px-4 py-2 border border-emerald-100 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
				>
					Précédent
				</button>
				<button
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage === totalPages}
					className="ml-3 relative inline-flex items-center px-4 py-2 border border-emerald-100 text-sm font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
				>
					Suivant
				</button>
			</div>
			<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
				<div>
					<p className="text-sm text-gray-700">
						Affichage de{" "}
						<span className="font-bold text-gray-900">
							{(currentPage - 1) * 20 + 1}
						</span>{" "}
						à{" "}
						<span className="font-bold text-gray-900">
							{Math.min(currentPage * 20, totalItems)}
						</span>{" "}
						sur <span className="font-bold text-gray-900">{totalItems}</span>{" "}
						résultats
					</p>
				</div>
				<div>
					<nav
						className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px"
						aria-label="Pagination"
					>
						<button
							onClick={() => onPageChange(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-emerald-600 disabled:opacity-50 transition-colors"
						>
							Précédent
						</button>
						{[...Array(totalPages)].map((_, i) => {
							const page = i + 1;
							if (
								page === 1 ||
								page === totalPages ||
								(page >= currentPage - 2 && page <= currentPage + 2)
							) {
								return (
									<button
										key={page}
										onClick={() => onPageChange(page)}
										className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-200 ${
											currentPage === page
												? "z-10 bg-emerald-500 border-emerald-500 text-white shadow-md transform scale-105"
												: "bg-white border-gray-200 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
										}`}
									>
										{page}
									</button>
								);
							} else if (page === currentPage - 3 || page === currentPage + 3) {
								return (
									<span
										key={page}
										className="relative inline-flex items-center px-4 py-2 border border-gray-200 bg-white text-sm font-medium text-gray-700"
									>
										...
									</span>
								);
							}
							return null;
						})}
						<button
							onClick={() =>
								onPageChange(Math.min(totalPages, currentPage + 1))
							}
							disabled={currentPage === totalPages}
							className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-emerald-600 disabled:opacity-50 transition-colors"
						>
							Suivant
						</button>
					</nav>
				</div>
			</div>
		</div>
	);
};

export default SubscriptionPagination;
