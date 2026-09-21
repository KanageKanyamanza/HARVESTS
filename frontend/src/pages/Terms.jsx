import React from "react";
import { useTranslation } from "react-i18next";
import Layout from "../components/layout/Layout";

const Terms = () => {
	const { t } = useTranslation("public");
	const sections = t("terms.sections", { returnObjects: true });

	return (
		<Layout>
			<div className="min-h-screen py-12 md:py-20">
				<div className="container-xl">
					<div className="max-w-4xl mx-auto">
						{/* Header */}
						<div className="text-center mb-12">
							<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								{t("terms.title")}
							</h1>
							<p className="text-gray-500">
								{t("terms.lastUpdatedLabel")} {t("terms.lastUpdatedDate")}
							</p>
						</div>

						{/* Content */}
						<div className="bg-white rounded-2xl shadow-sm p-6 md:p-10 prose prose-gray max-w-none">
							{sections.map((section) => (
								<section key={section.title} className="mb-8">
									<h2 className="text-xl font-bold text-gray-900 mb-4">
										{section.title}
									</h2>
									{section.intro && (
										<p className="text-gray-600 leading-relaxed mb-4">
											{section.intro}
										</p>
									)}
									{section.items && (
										<ul className="list-disc list-inside text-gray-600 space-y-2">
											{section.items.map((item) => (
												<li key={item}>{item}</li>
											))}
										</ul>
									)}
									{section.text && (
										<p className="text-gray-600 leading-relaxed">{section.text}</p>
									)}
								</section>
							))}

							<section className="mb-8">
								<h2 className="text-xl font-bold text-gray-900 mb-4">
									{t("terms.contactTitle")}
								</h2>
								<p className="text-gray-600 leading-relaxed">
									{t("terms.contactIntro")}
									<br />
									{t("terms.emailLabel")} contact@harvests.site
									<br />
									{t("terms.phoneLabel")} +221 78 834 69 69
								</p>
							</section>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default Terms;
