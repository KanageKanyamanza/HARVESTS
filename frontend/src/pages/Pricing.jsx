import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiX, FiTrendingUp, FiZap, FiArrowRight } from "react-icons/fi";
import { Sparkles, ShieldCheck, Sprout, Building2, Globe, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import SEOHead from "../components/seo/SEOHead";

// Partie non textuelle des plans (le texte vient de pricing.plans.* dans les locales).
// includedCount : nombre de fonctionnalités incluses, dans l'ordre de la liste traduite.
const PLAN_META = [
	{
		id: "gratuit",
		icon: <Sprout className="w-6 h-6 text-[#1A5514]" />,
		monthlyPrice: 0,
		annualPrice: 0,
		includedCount: 5,
		ctaLink: "/register",
		paymentLink: "/payment/subscription/gratuit",
		popular: false,
	},
	{
		id: "standard",
		icon: <FiTrendingUp className="w-6 h-6 text-[#1A5514]" />,
		monthlyPrice: 3000,
		annualPrice: 25000,
		includedCount: 7,
		ctaLink: "/register",
		paymentLink: "/payment/subscription/standard",
		popular: false,
	},
	{
		id: "premium",
		icon: <Sparkles className="w-6 h-6 text-yellow-400" />,
		monthlyPrice: 10000,
		annualPrice: 75000,
		includedCount: 9,
		ctaLink: "/register",
		paymentLink: "/payment/subscription/premium",
		popular: true,
	},
];

// Icônes des 4 profils, dans le même ordre que pricing.profiles (locales)
const PROFILE_ICONS = [Sprout, Building2, ShieldCheck, Globe];

const Pricing = () => {
	const { t, i18n } = useTranslation("public");
	const { isAuthenticated } = useAuth();
	const navigate = useNavigate();
	const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" ou "annual"

	const plans = PLAN_META.map((meta) => {
		const text = t(`pricing.plans.${meta.id}`, { returnObjects: true });
		return {
			...meta,
			...text,
			features: text.features.map((feature, index) => ({
				text: feature,
				included: index < meta.includedCount,
			})),
		};
	});

	const comparisonTable = t("pricing.comparison", { returnObjects: true });
	const profiles = t("pricing.profiles", { returnObjects: true }).map((profile, index) => ({
		...profile,
		icon: PROFILE_ICONS[index],
	}));

	const formatPrice = (price) =>
		new Intl.NumberFormat(i18n.language === "en" ? "en-US" : "fr-FR").format(price);

	return (
		<div className="min-h-screen bg-[#F8FAF6] pb-16">
			<SEOHead />

			<div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-3 sm:pt-4">

				{/* Hero Banner Agritech */}
				<div className="relative rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-6 sm:p-10 mb-8 overflow-hidden shadow-xl border border-emerald-800/40 text-center">
					<div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

					<div className="relative z-10 max-w-3xl mx-auto">
						<div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
							<FiZap className="w-4 h-4 text-[#31BC2E]" />
							<span>{t("pricing.badge")}</span>
						</div>

						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-4">
							{t("pricing.heroTitle")}
						</h1>

						<p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl mx-auto">
							{t("pricing.heroDescription")}
						</p>

						{/* Billing Switcher Toggle */}
						<div className="inline-flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
							<button
								onClick={() => setBillingCycle("monthly")}
								className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
									billingCycle === "monthly"
										? "bg-white text-[#161D14] shadow-md"
										: "text-emerald-100 hover:text-white"
								}`}
							>
								{t("pricing.billingMonthly")}
							</button>
							<button
								onClick={() => setBillingCycle("annual")}
								className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 ${
									billingCycle === "annual"
										? "bg-[#31BC2E] text-white shadow-md"
										: "text-emerald-100 hover:text-white"
								}`}
							>
								<span>{t("pricing.billingAnnual")}</span>
								<span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px]">
									{t("pricing.saveAnnual")}
								</span>
							</button>
						</div>
					</div>
				</div>

				{/* Pricing Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12 items-stretch">
					{plans.map((plan) => {
						const price = billingCycle === "annual" ? Math.round(plan.annualPrice / 12) : plan.monthlyPrice;

						return (
							<div
								key={plan.id}
								className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative ${
									plan.popular
										? "border-[#1A5514] shadow-2xl ring-2 ring-[#1A5514]/30 scale-102 md:-translate-y-2"
										: "border-gray-200/90 shadow-sm hover:shadow-lg hover:border-emerald-300"
								}`}
							>
								{/* Popular Ribbon */}
								{plan.popular && (
									<div className="bg-[#1A5514] text-white text-[11px] font-extrabold uppercase tracking-wider text-center py-1.5 shadow-sm flex items-center justify-center gap-1.5">
										<Sparkles className="w-3.5 h-3.5 text-yellow-400" />
										<span>{t("pricing.popularRibbon")}</span>
									</div>
								)}

								<div className="p-6 sm:p-8 space-y-6">
									{/* Card Top */}
									<div className="flex items-center justify-between">
										<div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
											{plan.icon}
										</div>
										<span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
											plan.popular ? "bg-emerald-100 text-[#1A5514]" : "bg-gray-100 text-gray-700"
										}`}>
											{plan.badge}
										</span>
									</div>

									{/* Plan Name & Desc */}
									<div>
										<h3 className="text-2xl font-black text-[#161D14] mb-1">{plan.name}</h3>
										<p className="text-xs text-gray-500 font-medium">{plan.subtitle}</p>
									</div>

									{/* Price Display */}
									<div className="pt-2 pb-2 border-y border-gray-100">
										<div className="flex items-baseline gap-1">
											<span className="text-3xl sm:text-4xl font-black text-[#161D14]">
												{price === 0 ? "0" : formatPrice(price)}
											</span>
											<span className="text-xs font-bold text-gray-600">FCFA</span>
											<span className="text-xs text-gray-400 font-medium">{t("pricing.perMonth")}</span>
										</div>

										{billingCycle === "annual" && plan.annualPrice > 0 && (
											<div className="mt-1.5 text-xs text-emerald-700 font-semibold">
												{t("pricing.billedAnnually", { amount: formatPrice(plan.annualPrice) })}
											</div>
										)}
									</div>

									<p className="text-xs text-gray-600 leading-relaxed min-h-[40px]">
										{plan.description}
									</p>

									{/* CTA Button */}
									<button
										onClick={() => {
											if (isAuthenticated && plan.paymentLink) {
												navigate(plan.paymentLink);
											} else {
												navigate(plan.ctaLink);
											}
										}}
										className={`w-full py-3 px-5 rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 ${
											plan.popular
												? "bg-[#1A5514] hover:bg-[#31BC2E] text-white shadow-md"
												: "bg-gray-900 hover:bg-[#1A5514] text-white"
										}`}
									>
										<span>{isAuthenticated && plan.paymentLink ? t("pricing.subscribeNow") : plan.cta}</span>
										<FiArrowRight className="w-4 h-4" />
									</button>

									{/* Features List */}
									<div className="space-y-3 pt-4 border-t border-gray-100">
										<h4 className="text-xs font-extrabold text-[#161D14] uppercase tracking-wider">
											{t("pricing.includedTitle")}
										</h4>
										<ul className="space-y-2.5">
											{plan.features.map((feature, idx) => (
												<li key={idx} className="flex items-start text-xs">
													{feature.included ? (
														<CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
													) : (
														<FiX className="w-4 h-4 text-gray-300 mr-2 flex-shrink-0 mt-0.5" />
													)}
													<span className={feature.included ? "text-gray-800 font-medium" : "text-gray-400 line-through"}>
														{feature.text}
													</span>
												</li>
											))}
										</ul>
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Comparison Table */}
				<div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden mb-12">
					<div className="p-6 border-b border-gray-100">
						<h2 className="text-xl sm:text-2xl font-black text-[#161D14] text-center">
							{t("pricing.comparisonTitle")}
						</h2>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full text-xs">
							<thead>
								<tr className="bg-gradient-to-r from-[#161D14] to-[#1A5514] text-white">
									<th className="px-6 py-4 text-left font-extrabold">{t("pricing.colFeature")}</th>
									<th className="px-6 py-4 text-center font-extrabold">{t("pricing.colFree")}</th>
									<th className="px-6 py-4 text-center font-extrabold">{t("pricing.colStandard")}</th>
									<th className="px-6 py-4 text-center font-extrabold text-emerald-300">{t("pricing.colPremium")}</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{comparisonTable.map((row, idx) => (
									<tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#F8FAF6]"}>
										<td className="px-6 py-3.5 font-bold text-gray-900">{row.feature}</td>
										<td className="px-6 py-3.5 text-center text-gray-600">{row.gratuit}</td>
										<td className="px-6 py-3.5 text-center text-gray-800 font-semibold">{row.standard}</td>
										<td className="px-6 py-3.5 text-center font-extrabold text-[#1A5514]">{row.premium}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* Recommendations Grid */}
				<div className="mb-12">
					<h2 className="text-xl sm:text-2xl font-black text-[#161D14] text-center mb-6">
						{t("pricing.profilesTitle")}
					</h2>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						{profiles.map((item, idx) => {
							const Icon = item.icon;
							return (
								<div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm space-y-2">
									<div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#1A5514] mb-3">
										<Icon className="w-5 h-5" />
									</div>
									<h3 className="font-extrabold text-sm text-[#161D14]">{item.title}</h3>
									<p className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded inline-block">
										{t("pricing.recommended", { plan: item.plan })}
									</p>
									<p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
								</div>
							);
						})}
					</div>
				</div>

				{/* CTA Banner */}
				<div className="rounded-2xl bg-gradient-to-r from-[#161D14] via-[#1A5514] to-[#0D330A] text-white p-8 sm:p-12 text-center shadow-xl border border-emerald-800/40">
					<h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
						{t("pricing.ctaTitle")}
					</h2>
					<p className="text-emerald-100/90 text-xs sm:text-sm max-w-xl mx-auto mb-6">
						{t("pricing.ctaDescription")}
					</p>
					<button
						onClick={() => {
							if (isAuthenticated) {
								navigate("/payment/subscription/standard");
							} else {
								navigate("/register");
							}
						}}
						className="inline-flex items-center gap-2 bg-[#31BC2E] hover:bg-[#289e26] text-white px-8 py-3.5 rounded-full font-extrabold text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl"
					>
						<span>{isAuthenticated ? t("pricing.ctaViewSubscriptions") : t("pricing.ctaCreateAccount")}</span>
						<FiArrowRight className="w-4 h-4" />
					</button>
				</div>

			</div>
		</div>
	);
};

export default Pricing;
