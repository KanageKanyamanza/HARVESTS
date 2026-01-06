import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AdminPagination = ({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	setCurrentPage,
}) => {
	if (totalPages <= 1) return null;

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-6">
			<div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
				Affichage de{" "}
				<span className="text-gray-900 font-black">
					{(currentPage - 1) * itemsPerPage + 1}
				</span>{" "}
				-{" "}
				<span className="text-gray-900 font-black">
					{Math.min(currentPage * itemsPerPage, totalItems)}
				</span>{" "}
				sur <span className="text-gray-900 font-black">{totalItems}</span>{" "}
				profils
			</div>

			<div className="flex items-center space-x-3">
				<button
					onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
					disabled={currentPage === 1}
					className="flex items-center px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
				>
					<ChevronLeft className="h-4 w-4 mr-2" />
					Precedent
				</button>

				<div className="flex items-center space-x-1">
					{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
						let pageNum;
						if (totalPages <= 5) {
							pageNum = i + 1;
						} else if (currentPage <= 3) {
							pageNum = i + 1;
						} else if (currentPage >= totalPages - 2) {
							pageNum = totalPages - 4 + i;
						} else {
							pageNum = currentPage - 2 + i;
						}
						return (
							<button
								key={pageNum}
								onClick={() => setCurrentPage(pageNum)}
								className={`w-10 h-10 flex items-center justify-center text-[10px] font-black rounded-xl transition-all duration-500 ${
									currentPage === pageNum
										? "bg-gray-900 text-white shadow-lg shadow-gray-200"
										: "text-gray-400 bg-white border border-gray-100 hover:border-gray-900 hover:text-gray-900"
								}`}
							>
								{pageNum}
							</button>
						);
					})}
				</div>

				<button
					onClick={() =>
						setCurrentPage((prev) => Math.min(totalPages, prev + 1))
					}
					disabled={currentPage === totalPages}
					className="flex items-center px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
				>
					Suivant
					<ChevronRight className="h-4 w-4 ml-2" />
				</button>
			</div>
		</div>
	);
};

export default AdminPagination;
