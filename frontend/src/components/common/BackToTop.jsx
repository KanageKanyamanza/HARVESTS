import React from "react";
import { ArrowBigUp } from "lucide-react";
import useBackToTopVisible from "../../hooks/useBackToTopVisible";

const BackToTop = () => {
	const isVisible = useBackToTopVisible();

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	if (!isVisible) return null;

	return (
		<button
			onClick={scrollToTop}
			className="fixed bottom-6 right-6 z-50 p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 hover:scale-110 transition-all duration-300 ease-in-out"
			aria-label="Retour en haut"
		>
			<ArrowBigUp className="h-6 w-6" />
		</button>
	);
};

export default BackToTop;

