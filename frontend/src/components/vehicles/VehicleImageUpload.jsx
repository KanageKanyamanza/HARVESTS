import React from "react";
import { FiUpload, FiX } from "react-icons/fi";
import CloudinaryImage from "../common/CloudinaryImage";
import LoadingSpinner from "../common/LoadingSpinner";

const VehicleImageUpload = ({
	vehicleImage,
	uploadingImage,
	fileInputRef,
	onFileSelect,
	onDrop,
	onRemove,
}) => {
	return (
		<div className="flex flex-col items-center space-y-6 py-2">
			<div className="relative group">
				<div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
				<div
					className="relative h-48 w-48 bg-gray-50 rounded-[1.8rem] overflow-hidden flex items-center justify-center border-4 border-white shadow-inner cursor-pointer"
					onClick={() =>
						!uploadingImage && !vehicleImage && fileInputRef.current?.click()
					}
					onDrop={onDrop}
					onDragOver={(e) => e.preventDefault()}
				>
					{vehicleImage?.url ?
						<CloudinaryImage
							src={vehicleImage.url}
							alt={vehicleImage.alt || "Véhicule"}
							className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
							width={300}
							height={300}
						/>
					: uploadingImage ?
						<LoadingSpinner size="md" text="" />
					:	<div className="flex flex-col items-center">
							<FiUpload className="w-8 h-8 text-indigo-200 mb-2" />
							<span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest text-center px-4">
								Cliquez ou glissez
							</span>
						</div>
					}
				</div>
			</div>

			<div className="flex flex-col w-full gap-3 px-2">
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					onChange={onFileSelect}
					className="hidden"
				/>
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					disabled={uploadingImage}
					className="group relative inline-flex items-center justify-center px-6 py-3.5 bg-gray-900 rounded-xl overflow-hidden transition-all hover:bg-indigo-600 hover:ring-4 hover:ring-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<FiUpload className="h-4 w-4 mr-2 text-white/50 group-hover:text-white transition-colors" />
					<span className="text-[10px] font-black uppercase tracking-widest text-white">
						{uploadingImage ?
							"Chargement..."
						: vehicleImage ?
							"Changer l'image"
						:	"Ajouter une image"}
					</span>
				</button>

				{vehicleImage && (
					<button
						type="button"
						onClick={onRemove}
						className="inline-flex items-center justify-center px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-red-100 hover:border-red-600"
					>
						<FiX className="h-4 w-4 mr-2" />
						Supprimer l'image
					</button>
				)}
			</div>
		</div>
	);
};

export default VehicleImageUpload;
