export const getProductImage = (product) => {
	if (product?.images?.length > 0) {
		const img = product.images[0];
		if (typeof img === "string") return img;
		if (img?.url) return img.url;
		if (img?.public_id)
			return `https://res.cloudinary.com/harvests/image/upload/w_100,h_100,c_fill/${img.public_id}`;
	}
	return null;
};

export const getUserImage = (user) => {
	if (user?.profileImage) {
		if (typeof user.profileImage === "string") return user.profileImage;
		if (user.profileImage?.url) return user.profileImage.url;
	}
	return null;
};

export const getSellerName = (seller) => {
	if (!seller) return "Vendeur";
	return (
		seller.farmName ||
		seller.companyName ||
		seller.restaurantName ||
		`${seller.firstName || ""} ${seller.lastName || ""}`.trim() ||
		"Vendeur"
	);
};

export const getSellerType = (userType) => {
	const types = {
		producer: "Producteur",
		transformer: "Transformateur",
		restaurateur: "Restaurateur",
	};
	return types[userType] || "Vendeur";
};

export const getTransporterName = (t) => {
	if (!t) return "Transporteur";
	return (
		t.companyName ||
		`${t.firstName || ""} ${t.lastName || ""}`.trim() ||
		"Transporteur"
	);
};

export const getProductName = (product) => {
	if (!product) return "Produit";
	if (typeof product.name === "object")
		return product.name.fr || product.name.en || "Produit";
	return product.name || "Produit";
};
