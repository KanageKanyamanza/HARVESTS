import React, { useState } from "react";
import {
	ThumbsUp,
	ThumbsDown,
	Calendar,
	User,
	CheckCircle,
	Image as ImageIcon,
	Video,
	MessageCircle,
	Heart,
	Send,
} from "lucide-react";
import StarRating from "./StarRating";
import CloudinaryImage from "../common/CloudinaryImage";
import { reviewService } from "../../services/reviewService";

const ReviewCard = ({
	review: initialReview,
	showProductInfo = false,
	showProducerResponse = true,
	onVoteHelpful = null,
	onVoteUnhelpful = null,
	currentUserId = null,
}) => {
	const [review, setReview] = useState(initialReview);

	// Mettre à jour l'état local si l'avis change (ex: rechargement parent)
	React.useEffect(() => {
		setReview(initialReview);
	}, [initialReview]);

	const [isVoting, setIsVoting] = useState(false);
	const [showReplyForm, setShowReplyForm] = useState(false);
	const [replyContent, setReplyContent] = useState("");
	const [isSubmittingReply, setIsSubmittingReply] = useState(false);
	const [isLiking, setIsLiking] = useState(false);

	const formatDate = (date) => {
		return new Date(date).toLocaleDateString("fr-FR", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handleVote = async (voteType) => {
		if (!onVoteHelpful || !onVoteUnhelpful || isVoting) return;

		setIsVoting(true);
		try {
			if (voteType === "helpful") {
				const res = await onVoteHelpful(review._id);
				if (res && res.data) setReview((prev) => ({ ...prev, ...res.data }));
			} else {
				const res = await onVoteUnhelpful(review._id);
				if (res && res.data) setReview((prev) => ({ ...prev, ...res.data }));
			}
		} catch (error) {
			console.error("Erreur lors du vote:", error);
		} finally {
			setIsVoting(false);
		}
	};

	const handleLikeReview = async () => {
		if (!currentUserId || isLiking) return;
		setIsLiking(true);
		try {
			const res = await reviewService.likeReview(review._id);
			if (res.status === "success") {
				setReview((prev) => ({
					...prev,
					likes: res.data.likes,
				}));
			}
		} catch (error) {
			console.error("Erreur like review:", error);
		} finally {
			setIsLiking(false);
		}
	};

	const handleLikeReply = async (replyId) => {
		if (!currentUserId) return;
		try {
			const res = await reviewService.likeReply(review._id, replyId);
			if (res.status === "success") {
				setReview((prev) => ({
					...prev,
					replies: prev.replies.map((r) =>
						r._id === replyId ? { ...r, likes: res.data.likes } : r
					),
				}));
			}
		} catch (error) {
			console.error("Erreur like reply:", error);
		}
	};

	const handleSubmitReply = async (e) => {
		e.preventDefault();
		if (!replyContent.trim() || isSubmittingReply) return;

		setIsSubmittingReply(true);
		try {
			const res = await reviewService.addReply(review._id, replyContent);
			if (res.status === "success") {
				setReview((prev) => ({
					...prev,
					replies: res.data.replies,
				}));
				setReplyContent("");
				setShowReplyForm(false);
			}
		} catch (error) {
			console.error("Erreur ajout commentaire:", error);
		} finally {
			setIsSubmittingReply(false);
		}
	};

	const hasUserVoted =
		currentUserId &&
		review.voters?.some(
			(v) => (typeof v === "string" ? v : v.user) === currentUserId
		);
	const canVote =
		currentUserId && !hasUserVoted && review.reviewer._id !== currentUserId;
	const isLikedByMe = currentUserId && review.likes?.includes(currentUserId);

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow h-full flex flex-col">
			<div className="flex-grow">
				{/* Header */}
				<div className="flex items-start justify-between mb-4">
					<div className="flex items-center space-x-3">
						<div className="flex-shrink-0">
							{review.reviewer.avatar ? (
								<CloudinaryImage
									src={review.reviewer.avatar}
									alt={review.reviewer.firstName}
									className="h-10 w-10 rounded-full object-cover"
								/>
							) : (
								<div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white shadow-sm">
									<User className="h-5 w-5 text-gray-600" />
								</div>
							)}
						</div>
						<div>
							<div className="flex items-center space-x-2">
								<h4 className="text-sm font-semibold text-gray-900">
									{review.reviewer.firstName} {review.reviewer.lastName}
								</h4>
								{review.isVerifiedPurchase && (
									<CheckCircle
										className="h-4 w-4 text-green-500"
										title="Achat vérifié"
									/>
								)}
							</div>
							<div className="flex items-center space-x-2 text-xs text-gray-500">
								<Calendar className="h-3 w-3" />
								<span>{formatDate(review.createdAt)}</span>
							</div>
						</div>
					</div>

					<div className="flex items-center space-x-2 bg-harvests-light px-2 py-1 rounded-full">
						<StarRating rating={review.rating} size="sm" />
					</div>
				</div>

				{/* Product Info */}
				{showProductInfo && review.product && (
					<div className="mb-4 p-3 bg-harvests-light rounded-lg border border-gray-100">
						<div className="flex items-center space-x-3">
							{review.product.images?.[0] && (
								<CloudinaryImage
									src={review.product.images[0].url}
									alt={review.product.name}
									className="h-12 w-12 rounded object-cover shadow-sm"
								/>
							)}
							<div>
								<h5 className="text-sm font-semibold text-gray-900 line-clamp-1">
									{review.product.name}
								</h5>
								<p className="text-xs text-gray-500">
									Par {review.producer?.firstName} {review.producer?.lastName}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Review Content */}
				<div className="mb-4">
					{review.title && (
						<h3 className="text-base font-bold text-gray-900 mb-1">
							{review.title}
						</h3>
					)}
					<p className="text-gray-700 text-sm leading-relaxed">
						{review.comment}
					</p>
				</div>

				{/* Media */}
				{review.media && review.media.length > 0 && (
					<div className="mb-4">
						<div className="grid grid-cols-3 gap-2">
							{review.media.map((media, index) => (
								<div
									key={index}
									className="relative aspect-square overflow-hidden rounded-lg border border-gray-100"
								>
									{media.type === "image" ? (
										<CloudinaryImage
											src={media.url}
											alt={`Image ${index + 1}`}
											className="w-full h-full object-cover hover:scale-105 transition-transform"
										/>
									) : (
										<div className="w-full h-full bg-gray-100 flex items-center justify-center">
											<Video className="h-6 w-6 text-gray-400" />
										</div>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Producer Response */}
				{showProducerResponse && review.producerResponse && (
					<div className="mb-4 p-3 bg-primary-50 border-l-4 border-primary-400 rounded-r-lg">
						<div className="flex items-center justify-between mb-1">
							<h5 className="text-xs font-bold text-primary-800 uppercase tracking-wider">
								Réponse du producteur
							</h5>
							<span className="text-[10px] text-primary-600">
								{formatDate(review.producerResponse.respondedAt)}
							</span>
						</div>
						<p className="text-sm text-primary-700 italic font-medium">
							"{review.producerResponse.comment}"
						</p>
					</div>
				)}

				{/* Replies List */}
				{review.replies && review.replies.length > 0 && (
					<div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-100">
						{review.replies.map((reply) => (
							<div
								key={reply._id}
								className="bg-gray-50 rounded-lg p-3 text-sm"
							>
								<div className="flex items-center justify-between mb-1">
									<div className="flex items-center space-x-2">
										<span className="font-semibold text-gray-900">
											{reply.user?.firstName} {reply.user?.lastName}
										</span>
										<span className="text-[10px] text-gray-500">
											{formatDate(reply.createdAt)}
										</span>
									</div>
								</div>
								<p className="text-gray-700 mb-2">{reply.content}</p>
								<div className="flex items-center space-x-3">
									<button
										onClick={() => handleLikeReply(reply._id)}
										className={`flex items-center space-x-1 text-xs transition-colors ${
											currentUserId && reply.likes?.includes(currentUserId)
												? "text-primary-600 font-medium"
												: "text-gray-500 hover:text-primary-500"
										}`}
									>
										<Heart
											className={`h-3 w-3 ${
												currentUserId && reply.likes?.includes(currentUserId)
													? "fill-current"
													: ""
											}`}
										/>
										<span>{reply.likes?.length || 0}</span>
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Footer Actions */}
			<div className="pt-4 mt-4 border-t border-gray-100">
				<div className="flex items-center justify-between mb-3">
					<div className="flex items-center space-x-4">
						{/* Nouveau système de Like */}
						<button
							onClick={handleLikeReview}
							className={`flex items-center space-x-1.5 text-sm transition-all ${
								isLikedByMe
									? "text-primary-600 font-bold scale-110"
									: "text-gray-500 hover:text-primary-500"
							}`}
						>
							<Heart
								className={`h-4 w-4 ${isLikedByMe ? "fill-current" : ""}`}
							/>
							<span>{review.likes?.length || 0}</span>
						</button>

						{/* Bouton Répondre */}
						<button
							onClick={() => setShowReplyForm(!showReplyForm)}
							className={`flex items-center space-x-1.5 text-sm transition-colors ${
								showReplyForm
									? "text-primary-600 font-bold"
									: "text-gray-500 hover:text-primary-500"
							}`}
						>
							<MessageCircle className="h-4 w-4" />
							<span>Répondre</span>
						</button>
					</div>

					<div className="flex items-center space-x-3">
						<button
							onClick={() => handleVote("helpful")}
							disabled={!canVote || isVoting}
							className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors ${
								canVote
									? "text-gray-600 hover:bg-green-50 hover:text-green-600"
									: "text-gray-300 cursor-not-allowed"
							}`}
							title="Utile"
						>
							<ThumbsUp className="h-3.5 w-3.5" />
							<span>{review.helpfulVotes || 0}</span>
						</button>

						<button
							onClick={() => handleVote("unhelpful")}
							disabled={!canVote || isVoting}
							className={`flex items-center space-x-1 text-xs px-2 py-1 rounded transition-colors ${
								canVote
									? "text-gray-600 hover:bg-red-50 hover:text-red-600"
									: "text-gray-300 cursor-not-allowed"
							}`}
							title="Pas utile"
						>
							<ThumbsDown className="h-3.5 w-3.5" />
							<span>{review.unhelpfulVotes || 0}</span>
						</button>
					</div>
				</div>

				{/* Reply Form */}
				{showReplyForm && (
					<form onSubmit={handleSubmitReply} className="mt-3 relative">
						{!currentUserId ? (
							<p className="text-xs text-center text-gray-500 py-2 border border-dashed border-gray-200 rounded">
								Connectez-vous pour répondre
							</p>
						) : (
							<div className="flex items-end space-x-2">
								<div className="flex-1">
									<textarea
										value={replyContent}
										onChange={(e) => setReplyContent(e.target.value)}
										placeholder="Écrire un commentaire..."
										className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-primary-400 focus:border-primary-400 outline-none resize-none"
										rows="2"
										maxLength="500"
									/>
									<div className="text-[10px] text-gray-400 text-right mt-1">
										{replyContent.length}/500
									</div>
								</div>
								<button
									type="submit"
									disabled={!replyContent.trim() || isSubmittingReply}
									className={`p-2 rounded-lg bg-primary-600 text-white transition-all ${
										!replyContent.trim() || isSubmittingReply
											? "opacity-50 cursor-not-allowed"
											: "hover:bg-primary-700 shadow-md"
									}`}
								>
									<Send className="h-4 w-4" />
								</button>
							</div>
						)}
					</form>
				)}
			</div>
		</div>
	);
};

export default ReviewCard;
