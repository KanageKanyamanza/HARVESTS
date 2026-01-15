import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../services/api";
import { FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";

const Unsubscribe = () => {
	const [searchParams] = useSearchParams();
	const email = searchParams.get("email");
	const [status, setStatus] = useState("confirm"); // confirm, processing, success, error
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (!email) {
			setStatus("error");
			setMessage("Adresse email manquante dans le lien de désinscription.");
		}
	}, [email]);

	const handleUnsubscribe = async () => {
		try {
			setStatus("processing");
			// Call backend API
			await api.get(
				`/newsletter/unsubscribe?email=${encodeURIComponent(email)}`
			);
			setStatus("success");
			setMessage("Vous avez été désabonné avec succès de notre newsletter.");
		} catch (error) {
			console.error("Unsubscribe error:", error);
			setStatus("error");
			setMessage(
				error.response?.data?.message ||
					"Une erreur est survenue lors de la désinscription. Veuillez réessayer."
			);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-green-100">
					{status === "success" ? (
						<FiCheckCircle className="h-10 w-10 text-green-600" />
					) : status === "error" ? (
						<FiXCircle className="h-10 w-10 text-red-600" />
					) : (
						<FiAlertCircle className="h-10 w-10 text-orange-600" />
					)}
				</div>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Désinscription Newsletter
				</h2>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
					{status === "confirm" && (
						<div>
							<p className="text-gray-600 mb-6">
								Voulez-vous vraiment vous désabonner de la newsletter de
								Harvests pour l'adresse <strong>{email}</strong> ?
							</p>
							<p className="text-sm text-gray-500 mb-6">
								Vous ne recevrez plus nos actualités et offres spéciales.
							</p>
							<div className="flex flex-col space-y-3">
								<button
									onClick={handleUnsubscribe}
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
								>
									Confirmer la désinscription
								</button>
								<Link
									to="/"
									className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
								>
									Annuler et retourner à l'accueil
								</Link>
							</div>
						</div>
					)}

					{status === "processing" && (
						<div className="flex flex-col items-center">
							<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
							<p className="text-gray-600">Traitement de votre demande...</p>
						</div>
					)}

					{status === "success" && (
						<div>
							<p className="text-gray-600 mb-6">{message}</p>
							<Link
								to="/"
								className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
							>
								Retour à l'accueil
							</Link>
						</div>
					)}

					{status === "error" && (
						<div>
							<p className="text-red-500 mb-6">{message}</p>
							<Link
								to="/"
								className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
							>
								Retour à l'accueil
							</Link>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Unsubscribe;
