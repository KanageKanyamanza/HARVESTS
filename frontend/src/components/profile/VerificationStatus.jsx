import React from "react";
import {
	ShieldCheck,
	CheckCircle2,
	AlertCircle,
	RefreshCw,
	Mail,
	Phone,
	Info,
} from "lucide-react";

const VerificationStatus = ({ verificationStatus, onRefresh }) => {
	if (!verificationStatus) return null;

	return (
		<div className="bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 border border-white/60 shadow-sm hover:shadow-xl transition-all duration-500">
			<div className="flex items-center justify-between mb-8">
				<h3 className="text-lg font-[1000] text-gray-900 tracking-tight flex items-center gap-3">
					<ShieldCheck className="h-6 w-6 text-emerald-600" />
					Niveau de Vérification
				</h3>
				<button
					onClick={onRefresh}
					className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
					title="Actualiser les statuts"
				>
					<RefreshCw className="w-4 h-4" />
				</button>
			</div>

			<div className="space-y-4">
				{/* Email Status */}
				<div className="flex items-center justify-between p-5 bg-white/50 border border-gray-100/50 rounded-2xl group transition-all hover:bg-white hover:shadow-md">
					<div className="flex items-center gap-4">
						<div
							className={`w-10 h-10 rounded-xl flex items-center justify-center ${
								verificationStatus.email?.verified ?
									"bg-emerald-50 text-emerald-600 border border-emerald-100"
								:	"bg-rose-50 text-rose-500 border border-rose-100"
							}`}
						>
							<Mail className="h-5 w-5" />
						</div>
						<div>
							<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
								Validation Email
							</p>
							<p className="text-sm font-bold text-gray-900">
								{verificationStatus.email?.verified ?
									"Authentifié"
								:	"Action requise"}
							</p>
						</div>
					</div>
					{verificationStatus.email?.verified ?
						<CheckCircle2 className="h-5 w-5 text-emerald-500" />
					:	<AlertCircle className="h-5 w-5 text-rose-500" />}
				</div>

				{/* Phone Status */}
				<div className="flex items-center justify-between p-5 bg-white/50 border border-gray-100/50 rounded-2xl group transition-all hover:bg-white hover:shadow-md">
					<div className="flex items-center gap-4">
						<div
							className={`w-10 h-10 rounded-xl flex items-center justify-center ${
								verificationStatus.phone?.verified ?
									"bg-emerald-50 text-emerald-600 border border-emerald-100"
								:	"bg-rose-50 text-rose-500 border border-rose-100"
							}`}
						>
							<Phone className="h-5 w-5" />
						</div>
						<div>
							<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
								Validation Mobile
							</p>
							<p className="text-sm font-bold text-gray-900">
								{verificationStatus.phone?.verified ?
									"Vérifié"
								:	"SMS non validé"}
							</p>
						</div>
					</div>
					{verificationStatus.phone?.verified ?
						<CheckCircle2 className="h-5 w-5 text-emerald-500" />
					:	<AlertCircle className="h-5 w-5 text-rose-500" />}
				</div>
			</div>

			<div className="mt-8 pt-6 border-t border-gray-100/50">
				<div className="flex items-center gap-2 mb-3">
					<Info className="h-3.5 w-3.5 text-gray-400" />
					<p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
						Score de Confiance Global
					</p>
				</div>
				<div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl p-5 shadow-lg shadow-emerald-100">
					<p className="text-sm font-black text-white uppercase tracking-widest flex items-center justify-between">
						{verificationStatus.overall?.level || "ÉVALUATION..."}
						<ShieldCheck className="h-4 w-4 opacity-50" />
					</p>
				</div>
			</div>
		</div>
	);
};

export default VerificationStatus;
