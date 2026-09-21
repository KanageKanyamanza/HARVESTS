import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEOHead from "../components/seo/SEOHead";
import {
	Check,
	Heart,
	Target,
	Shield,
	Zap,
	Layers,
	Eye,
	Scale,
	Users,
	Lightbulb,
} from "lucide-react";
import logo from "../assets/logo.png";

// Icônes des 10 valeurs, dans le même ordre que about.values (locales)
const VALUE_ICONS = [Heart, Target, Shield, Zap, Layers, Eye, Scale, Users, Heart, Lightbulb];

const About = () => {
	const { t } = useTranslation("public");
	const values = t("about.values", { returnObjects: true }).map((value, index) => ({
		...value,
		icon: VALUE_ICONS[index],
	}));

	return (
		<div className="min-h-screen bg-gradient-to-b from-harvests-light to-white">
			<SEOHead />
			{/* Hero Section */}
			<section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
				<div className="container-xl px-4">
					<div className="max-w-4xl mx-auto text-center">
						<div className="flex justify-center mb-6" data-aos="fade-down">
							<img src={logo} alt="Harvests Logo" className="h-20 w-auto" />
						</div>
						<h1
							className="text-4xl md:text-5xl font-bold mb-6"
							data-aos="fade-up"
							data-aos-delay="100"
						>
							{t("about.heroTitle")}
						</h1>
						<p
							className="text-xl md:text-2xl text-primary-100 mb-8"
							data-aos="fade-up"
							data-aos-delay="200"
						>
							{t("about.heroTagline")}
						</p>
						<p
							className="text-lg text-primary-200 max-w-2xl mx-auto"
							data-aos="fade-up"
							data-aos-delay="300"
						>
							{t("about.heroDescription")}
						</p>
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="py-16 bg-white">
				<div className="container-xl px-4">
					<div className="max-w-4xl mx-auto">
						<h2
							className="text-3xl font-bold text-gray-900 mb-6 text-center"
							data-aos="fade-up"
						>
							{t("about.missionTitle")}
						</h2>
						<div className="prose prose-lg max-w-none text-gray-700 text-center space-y-4">
							<p data-aos="fade-up" data-aos-delay="100">
								{t("about.missionP1")}
							</p>
							<p data-aos="fade-up" data-aos-delay="200">
								{t("about.missionP2")}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Values Section */}
			<section className="py-16 bg-harvests-light">
				<div className="container-xl px-4">
					<div className="max-w-6xl mx-auto">
						<h2
							className="text-3xl font-bold text-gray-900 mb-4 text-center"
							data-aos="fade-up"
						>
							{t("about.valuesTitle")}
						</h2>
						<p
							className="text-center text-gray-600 mb-12 max-w-2xl mx-auto"
							data-aos="fade-up"
							data-aos-delay="100"
						>
							{t("about.valuesSubtitle")}
						</p>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{values.map((value, index) => {
								const IconComponent = value.icon;
								return (
									<div
										key={index}
										className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
										data-aos="fade-up"
										data-aos-delay={100 + index * 50}
									>
										<div className="flex items-start space-x-4">
											<div className="flex-shrink-0">
												<div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
													<IconComponent className="h-6 w-6 text-primary-600" />
												</div>
											</div>
											<div className="flex-1">
												<div className="flex items-center space-x-2 mb-2">
													<Check className="h-5 w-5 text-green-600 flex-shrink-0" />
													<h3 className="text-xl font-semibold text-gray-900">
														{value.title}
													</h3>
												</div>
												{value.subtitle && (
													<p className="text-sm text-primary-600 font-medium mb-2">
														{value.subtitle}
													</p>
												)}
												<p className="text-gray-600 text-sm leading-relaxed">
													{value.description}
												</p>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</section>

			{/* Vision Section */}
			<section className="py-16 bg-white">
				<div className="container-xl px-4">
					<div className="max-w-4xl mx-auto">
						<h2
							className="text-3xl font-bold text-gray-900 mb-6 text-center"
							data-aos="fade-up"
						>
							{t("about.visionTitle")}
						</h2>
						<div className="prose prose-lg max-w-none text-gray-700 text-center space-y-4">
							<p data-aos="fade-up" data-aos-delay="100">
								{t("about.visionP1")}
							</p>
							<p data-aos="fade-up" data-aos-delay="200">
								{t("about.visionP2")}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Corporate Information Section */}
			<section className="py-12 bg-gray-50 border-t border-gray-100">
				<div className="container-xl px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">
							{t("about.corporateTitle")}
						</h3>
						<div className="space-y-2 text-gray-600">
							<p className="font-bold text-primary-700">
								UBUNTU BUSINESS BUILDERS (UBB) – SARL
							</p>
							<div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
								<p>
									<span className="font-medium text-gray-900">RCCM :</span>{" "}
									SN.DKR.2026.B.1650
								</p>
								<p>
									<span className="font-medium text-gray-900">NINEA :</span>{" "}
									012753069
								</p>
							</div>
							<p className="text-sm mt-4 italic text-gray-500">
								{t("about.trademark")}
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16 bg-primary-600 text-white">
				<div className="container-xl px-4">
					<div className="max-w-4xl mx-auto text-center">
						<h2 className="text-3xl font-bold mb-4" data-aos="fade-up">
							{t("about.ctaTitle")}
						</h2>
						<p
							className="text-xl text-primary-100 mb-8"
							data-aos="fade-up"
							data-aos-delay="100"
						>
							{t("about.ctaDescription")}
						</p>
						<div
							className="flex flex-wrap justify-center gap-4"
							data-aos="fade-up"
							data-aos-delay="200"
						>
							<Link
								to="/register"
								className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
							>
								{t("about.ctaRegister")}
							</Link>
							<Link
								to="/contact"
								className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors border border-primary-500"
							>
								{t("about.ctaContact")}
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
};

export default About;
