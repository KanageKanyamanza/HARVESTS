import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "lucide-react";
import Layout from "../components/layout/Layout";

const FAQ = () => {
	const { t } = useTranslation("public");
	const [openIndex, setOpenIndex] = useState(null);

	const faqs = t("faq.sections", { returnObjects: true });

	const toggleQuestion = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<Layout>
			<div className="min-h-screen py-12 md:py-20">
				<div className="container-xl">
					{/* Header */}
					<div className="text-center mb-12">
						<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							{t("faq.title")}
						</h1>
						<p className="text-gray-600 max-w-2xl mx-auto">
							{t("faq.description")}
						</p>
					</div>

					{/* FAQ Sections */}
					<div className="max-w-3xl mx-auto space-y-8">
						{faqs.map((section, sectionIndex) => (
							<div
								key={sectionIndex}
								className="bg-white rounded-2xl shadow-sm overflow-hidden"
							>
								<h2 className="text-lg font-semibold text-white bg-primary-600 px-6 py-4">
									{section.category}
								</h2>
								<div className="divide-y divide-gray-100">
									{section.questions.map((faq, qIndex) => {
										const index = `${sectionIndex}-${qIndex}`;
										const isOpen = openIndex === index;
										return (
											<div
												key={qIndex}
												className="border-b border-gray-100 last:border-0"
											>
												<button
													onClick={() => toggleQuestion(index)}
													className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
												>
													<span className="font-medium text-gray-900 pr-4">
														{faq.q}
													</span>
													{isOpen ?
														<ChevronUp className="h-5 w-5 text-primary-600 flex-shrink-0" />
													:	<ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
													}
												</button>
												{isOpen && (
													<div className="px-6 pb-4 text-gray-600 leading-relaxed">
														{faq.a}
													</div>
												)}
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>

					{/* Contact CTA */}
					<div className="mt-12 text-center">
						<p className="text-gray-600 mb-4">
							{t("faq.notFoundQuestion")}
						</p>
						<a
							href="/contact"
							className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-full hover:bg-primary-700 transition-colors"
						>
							{t("faq.contactUs")}
						</a>
					</div>
				</div>
			</div>
		</Layout>
	);
};

export default FAQ;
