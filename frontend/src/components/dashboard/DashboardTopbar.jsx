import React from "react";
import { useAuth } from "../../hooks/useAuth";
import { useUserType } from "../../hooks/useUserType";
import { FiMenu, FiBell } from "react-icons/fi";
import CloudinaryImage from "../common/CloudinaryImage";

const DashboardTopbar = ({ onMenuClick }) => {
	const { user, userInitials } = useAuth();
	const { displayIcon } = useUserType();

	return (
		<div className="h-16 bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
			<div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8">
				<div className="flex items-center space-x-4 float-left">
					<button
						onClick={onMenuClick}
						className="lg:hidden text-black hover:text-black"
					>
						<FiMenu className="h-6 w-6" />
					</button>
				</div>
				<div className="flex items-center space-x-4 ">
					{/* Notifications */}
					<button className="text-gray-400 hover:text-gray-500 relative">
						<FiBell className="h-6 w-6" />
						<span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
							3
						</span>
					</button>

					{/* User menu */}
					<div className="relative">
						<button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
							<div className="h-8 w-8 bg-harvests-green rounded-full flex items-center justify-center">
								<span className="text-white text-sm font-medium">
									{user?.avatar ? (
										<CloudinaryImage
											src={user?.avatar}
											alt="Avatar"
											className="h-8 w-8 rounded-full object-cover"
											width={32}
											height={32}
											crop="fill"
											quality="auto"
										/>
									) : (
										<span className="text-white text-sm font-medium">
											{userInitials ||
												user?.firstName?.charAt(0)?.toUpperCase() ||
												"?"}
										</span>
									)}
								</span>
								<CloudinaryImage
									src={user?.avatar}
									alt="Avatar"
									className="h-8 w-8 rounded-full object-cover"
									width={32}
									height={32}
									crop="fill"
									quality="auto"
								/>
							</div>
							<div className="hidden md:block">
								<div className="flex items-center space-x-1">
									<span className="text-xs">{displayIcon}</span>
									<span className="text-sm font-medium">
										{user?.firstName || "Utilisateur"}
									</span>
								</div>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DashboardTopbar;
