import React, { useState } from "react";
import {
	FiMail,
	FiPhone,
	FiMapPin,
	FiSend,
	FiCheckCircle,
	FiAlertCircle,
	FiTrendingUp,
	FiUsers,
	FiGlobe,
	FiTarget,
} from "react-icons/fi";
import { Briefcase } from "lucide-react";
import SEOHead from "../components/seo/SEOHead";
import { contactService } from "../services/contactService";

const Investors = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "Demande de pitch deck",
		message:
			"Bonjour,\n\nJe souhaiterais recevoir le pitch deck de Harvests ainsi que toute information complémentaire pour une éventuelle prise de contact.\n\nCordialement,",
		type: "investor",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState(null);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitStatus(null);

		try {
			await contactService.sendMessage(formData);
			setSubmitStatus("success");
			setFormData((prev) => ({ ...prev, name: "", email: "" }));
		} catch (error) {
			console.error("Erreur lors de l'envoi:", error);
			setSubmitStatus("error");
		} finally {
			setIsSubmitting(false);
		}
	};

	const highlights = [
		{
			icon: FiTrendingUp,
			title: "Marché en croissance",
			description:
				"L'agritech africaine connecte producteurs et acheteurs sur un marché encore largement informel.",
		},
		{
			icon: FiUsers,
			title: "Écosystème multi-acteurs",
			description:
				"Producteurs, transformateurs, restaurateurs, transporteurs et exportateurs réunis sur une seule plateforme.",
		},
		{
			icon: FiGlobe,
			title: "Ancrage local, ambition continentale",
			description:
				"Lancé au Sénégal, pensé dès l'origine pour s'étendre à l'ensemble du continent africain.",
		},
		{
			icon: FiTarget,
			title: "Impact mesurable",
			description:
				"Réduction des intermédiaires, meilleurs revenus pour les producteurs, traçabilité de la récolte à la vente.",
		},
	];

	const contactInfo = [
		{
			icon: <FiMail className="w-5 h-5" />,
			label: "Email",
			value: "contact@harvests.site",
			href: "mailto:contact@harvests.site?subject=Demande%20de%20pitch%20deck%20Harvests",
		},
		{
			icon: <FiPhone className="w-5 h-5" />,
			label: "Téléphone",
			value: "+221 78 834 69 69",
			href: "tel:+221788346969",
		},
		{
			icon: <FiMapPin className="w-5 h-5" />,
			label: "Adresse",
			value: "Dakar, Sénégal",
		},
	];

	return (
		<div className="min-h-screen bg-[#F8FAF6] pb-16">
			<SEOHead
				title="Invest"
				description="Contactez l'équipe Harvests pour recevoir le pitch deck et échanger sur les opportunités d'investissement."
			/>

			<div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-4">
				{/* Hero Banner Agritech */}
				<div className="relative rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-6 sm:p-10 mb-8 overflow-hidden shadow-xl border border-emerald-800/40 text-center">
					<div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

					<div className="relative z-10 max-w-3xl mx-auto">
						<div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
							<Briefcase className="w-4 h-4 text-[#31BC2E]" />
							<span>Espace Invest</span>
						</div>

						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
							Investissez dans l'avenir de l'agriculture africaine
						</h1>

						<p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
							Harvests connecte producteurs, transformateurs et acheteurs sur
							une même plateforme. Contactez-nous pour recevoir notre pitch
							deck et discuter des opportunités d'investissement.
						</p>
					</div>
				</div>

				{/* Points clés */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
					{highlights.map((item, index) => (
						<div
							key={index}
							className="bg-white rounded-lg shadow-sm p-6 text-center"
						>
							<div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-harvests-green/10 flex items-center justify-center text-harvests-green">
								<item.icon className="w-6 h-6" />
							</div>
							<h3 className="text-base font-semibold text-gray-900 mb-2">
								{item.title}
							</h3>
							<p className="text-sm text-gray-600">{item.description}</p>
						</div>
					))}
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Coordonnées */}
					<div className="lg:col-span-1">
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-2">
								Recevoir le pitch deck
							</h2>
							<p className="text-sm text-gray-600 mb-6">
								Contactez directement l'équipe fondatrice, ou passez par le
								formulaire ci-contre.
							</p>

							<div className="space-y-5">
								{contactInfo.map((info, index) => (
									<div key={index} className="flex items-start gap-3">
										<div className="flex-shrink-0 w-10 h-10 bg-harvests-green rounded-lg flex items-center justify-center text-white">
											{info.icon}
										</div>
										<div>
											<p className="text-xs text-gray-500">{info.label}</p>
											{info.href ? (
												<a
													href={info.href}
													className="text-gray-900 font-medium hover:text-harvests-green transition-colors"
												>
													{info.value}
												</a>
											) : (
												<p className="text-gray-900 font-medium">
													{info.value}
												</p>
											)}
										</div>
									</div>
								))}
							</div>

							<div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500 space-y-1">
								<p className="font-medium text-gray-700">
									UBUNTU BUSINESS BUILDERS (UBB) – SARL
								</p>
								<p>RCCM : SN.DKR.2026.B.1650</p>
								<p>NINEA : 012753069</p>
							</div>
						</div>
					</div>

					{/* Formulaire */}
					<div className="lg:col-span-2">
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h2 className="text-xl font-semibold text-gray-900 mb-6">
								Demander le pitch deck
							</h2>

							{submitStatus === "success" && (
								<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
									<FiCheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
									<p className="text-green-700 text-sm">
										Votre demande a bien été envoyée. Notre équipe vous
										recontactera avec le pitch deck dans les meilleurs délais.
									</p>
								</div>
							)}

							{submitStatus === "error" && (
								<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
									<FiAlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
									<p className="text-red-700 text-sm">
										Une erreur s'est produite lors de l'envoi. Vous pouvez
										aussi nous écrire directement à contact@harvests.site.
									</p>
								</div>
							)}

							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label
											htmlFor="name"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											Nom complet *
										</label>
										<input
											type="text"
											id="name"
											name="name"
											value={formData.name}
											onChange={handleInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harvests-green focus:border-transparent"
											placeholder="Votre nom complet"
										/>
									</div>

									<div>
										<label
											htmlFor="email"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											Email *
										</label>
										<input
											type="email"
											id="email"
											name="email"
											value={formData.email}
											onChange={handleInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harvests-green focus:border-transparent"
											placeholder="votre@email.com"
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="subject"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Sujet *
									</label>
									<input
										type="text"
										id="subject"
										name="subject"
										value={formData.subject}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harvests-green focus:border-transparent"
									/>
								</div>

								<div>
									<label
										htmlFor="message"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Message *
									</label>
									<textarea
										id="message"
										name="message"
										value={formData.message}
										onChange={handleInputChange}
										required
										rows={6}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harvests-green focus:border-transparent resize-none"
									/>
								</div>

								<div className="flex items-center justify-between">
									<p className="text-sm text-gray-500">* Champs obligatoires</p>
									<button
										type="submit"
										disabled={isSubmitting}
										className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-harvests-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-harvests-green disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isSubmitting ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
												Envoi en cours...
											</>
										) : (
											<>
												<FiSend className="w-4 h-4 mr-2" />
												Envoyer la demande
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Investors;
