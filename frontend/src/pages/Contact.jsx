import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
	FiMail,
	FiPhone,
	FiMapPin,
	FiClock,
	FiSend,
	FiCheckCircle,
	FiAlertCircle,
} from "react-icons/fi";
import SocialLinks from "../components/common/SocialLinks";
import { contactService } from "../services/contactService";
import SEOHead from "../components/seo/SEOHead";

// Icônes des 5 blocs de coordonnées, dans le même ordre que contact.info (locales)
const INFO_ICONS = [FiMail, FiPhone, FiMapPin, FiCheckCircle, FiClock];
const CONTACT_TYPE_VALUES = ["general", "support", "partnership", "complaint", "suggestion"];

const Contact = () => {
	const { t } = useTranslation("public");
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
		type: "general",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitStatus(null);

		try {
			await contactService.sendMessage(formData);

			setSubmitStatus("success");
			setFormData({
				name: "",
				email: "",
				subject: "",
				message: "",
				type: "general",
			});
		} catch (error) {
			console.error("Erreur lors de l'envoi:", error);
			setSubmitStatus("error");
		} finally {
			setIsSubmitting(false);
		}
	};

	const contactInfo = t("contact.info", { returnObjects: true }).map((info, index) => {
		const Icon = INFO_ICONS[index];
		return { ...info, icon: <Icon className="w-6 h-6" /> };
	});
	const quickFaq = t("contact.quickFaq", { returnObjects: true });

	const contactTypes = CONTACT_TYPE_VALUES.map((value) => ({
		value,
		label: t(`contact.types.${value}`),
	}));

	return (
		<div className="min-h-screen bg-gray-50 py-12">
			<SEOHead />
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-12">
					<h1
						className="text-4xl font-bold text-gray-900 mb-4"
						data-aos="fade-up"
					>
						{t("contact.title")}
					</h1>
					<p
						className="text-xl text-gray-600 max-w-3xl mx-auto"
						data-aos="fade-up"
						data-aos-delay="100"
					>
						{t("contact.description")}
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Informations de contact */}
					<div className="lg:col-span-1" data-aos="fade-right">
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h2 className="text-2xl font-semibold text-gray-900 mb-6">
								{t("contact.detailsTitle")}
							</h2>

							<div className="space-y-6">
								{contactInfo.map((info, index) => (
									<div key={index} className="flex items-start space-x-4">
										<div className="flex-shrink-0 w-12 h-12 bg-harvests-green bg-opacity-10 rounded-lg flex items-center justify-center text-white">
											{info.icon}
										</div>
										<div className="flex-1">
											<h3 className="text-lg font-medium text-gray-900 mb-1">
												{info.title}
											</h3>
											{info.details.map((detail, idx) => (
												<p key={idx} className="text-gray-600 mb-1">
													{detail}
												</p>
											))}
											<p className="text-sm text-gray-500">
												{info.description}
											</p>
										</div>
									</div>
								))}
							</div>

							{/* FAQ rapide */}
							<div className="mt-8 pt-6 border-t border-gray-200">
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									{t("contact.quickFaqTitle")}
								</h3>
								<div className="space-y-3">
									{quickFaq.map((item) => (
										<div key={item.q}>
											<h4 className="text-sm font-medium text-gray-900">
												{item.q}
											</h4>
											<p className="text-sm text-gray-600">{item.a}</p>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>

					{/* Formulaire de contact */}
					<div className="lg:col-span-2" data-aos="fade-left">
						<div className="bg-white rounded-lg shadow-sm p-6">
							<h2 className="text-2xl font-semibold text-gray-900 mb-6">
								{t("contact.formTitle")}
							</h2>

							{submitStatus === "success" && (
								<div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
									<FiCheckCircle className="w-5 h-5 text-green-500 mr-3" />
									<p className="text-green-700">{t("contact.success")}</p>
								</div>
							)}

							{submitStatus === "error" && (
								<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
									<FiAlertCircle className="w-5 h-5 text-red-500 mr-3" />
									<p className="text-red-700">{t("contact.error")}</p>
								</div>
							)}

							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label
											htmlFor="name"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											{t("contact.nameLabel")}
										</label>
										<input
											type="text"
											id="name"
											name="name"
											value={formData.name}
											onChange={handleInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harvests-green focus:border-transparent"
											placeholder={t("contact.namePlaceholder")}
										/>
									</div>

									<div>
										<label
											htmlFor="email"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											{t("contact.emailLabel")}
										</label>
										<input
											type="email"
											id="email"
											name="email"
											value={formData.email}
											onChange={handleInputChange}
											required
											className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harvests-green focus:border-transparent"
											placeholder={t("contact.emailPlaceholder")}
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="type"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										{t("contact.typeLabel")}
									</label>
									<select
										id="type"
										name="type"
										value={formData.type}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harvests-green focus:border-transparent"
									>
										{contactTypes.map((type) => (
											<option key={type.value} value={type.value}>
												{type.label}
											</option>
										))}
									</select>
								</div>

								<div>
									<label
										htmlFor="subject"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										{t("contact.subjectLabel")}
									</label>
									<input
										type="text"
										id="subject"
										name="subject"
										value={formData.subject}
										onChange={handleInputChange}
										required
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harvests-green focus:border-transparent"
										placeholder={t("contact.subjectPlaceholder")}
									/>
								</div>

								<div>
									<label
										htmlFor="message"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										{t("contact.messageLabel")}
									</label>
									<textarea
										id="message"
										name="message"
										value={formData.message}
										onChange={handleInputChange}
										required
										rows={6}
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-harvests-green focus:border-transparent resize-none"
										placeholder={t("contact.messagePlaceholder")}
									/>
								</div>

								<div className="flex items-center justify-between">
									<p className="text-sm text-gray-500">{t("contact.requiredFields")}</p>
									<button
										type="submit"
										disabled={isSubmitting}
										className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-harvests-green hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-harvests-green disabled:opacity-50 disabled:cursor-not-allowed"
									>
										{isSubmitting ?
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
												{t("contact.sending")}
											</>
										:	<>
												<FiSend className="w-4 h-4 mr-2" />
												{t("contact.send")}
											</>
										}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>

				{/* Section supplémentaire */}
				<div className="mt-12 bg-harvests-green rounded-lg p-8 text-center text-white">
					<h2 className="text-2xl font-bold mb-4">
						{t("contact.communityTitle")}
					</h2>
					<p className="text-lg mb-6 opacity-90">
						{t("contact.communityDescription")}
					</p>
					<div className="flex justify-center">
						<SocialLinks
							variant="light"
							size="lg"
							showLabels={false}
							className="text-white"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Contact;
