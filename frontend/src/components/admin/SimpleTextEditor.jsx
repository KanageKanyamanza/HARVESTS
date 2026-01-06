import React, { useState, useRef, useEffect } from "react";
import {
	Bold,
	Italic,
	List,
	Link as LinkIcon,
	Image as ImageIcon,
	Type,
	Info,
	ChevronRight,
} from "lucide-react";

const SimpleTextEditor = ({
	value = "",
	onChange,
	placeholder = "Rédigez votre contenu...",
	className = "",
	editorId = "simple-editor",
}) => {
	const textareaRef = useRef(null);

	const insertText = (before, after = "") => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = value.substring(start, end);
		const newText =
			value.substring(0, start) +
			before +
			selectedText +
			after +
			value.substring(end);

		onChange(newText);

		// Restaurer la position du curseur
		setTimeout(() => {
			textarea.focus();
			const newPosition =
				start + before.length + selectedText.length + after.length;
			textarea.setSelectionRange(newPosition, newPosition);
		}, 0);
	};

	const handleBold = () => {
		insertText("**", "**");
	};

	const handleItalic = () => {
		insertText("*", "*");
	};

	const handleList = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const lineStart = value.lastIndexOf("\n", start - 1) + 1;
		const lineEnd = value.indexOf("\n", start);
		const line = value.substring(
			lineStart,
			lineEnd === -1 ? value.length : lineEnd
		);

		if (line.trim().startsWith("- ")) {
			// Retirer le formatage de liste
			const newText =
				value.substring(0, lineStart) +
				line.replace(/^-\s+/, "") +
				value.substring(lineEnd === -1 ? value.length : lineEnd);
			onChange(newText);
		} else {
			// Ajouter le formatage de liste
			const newText =
				value.substring(0, lineStart) +
				"- " +
				line +
				value.substring(lineEnd === -1 ? value.length : lineEnd);
			onChange(newText);
		}
	};

	const handleLink = () => {
		const textarea = textareaRef.current;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = value.substring(start, end);

		if (selectedText) {
			insertText("[", `](url)`);
		} else {
			insertText("[texte du lien](url)", "");
		}
	};

	const handleImage = () => {
		insertText("![alt text](image-url)", "");
	};

	const ToolbarButton = ({ onClick, icon: Icon, title, active = false }) => (
		<button
			type="button"
			onClick={onClick}
			className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
				active
					? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
					: "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
			}`}
			title={title}
		>
			<Icon className="h-4 w-4" />
		</button>
	);

	return (
		<div
			className={`flex flex-col bg-white rounded-3xl overflow-hidden ${className}`}
		>
			{/* Toolbar */}
			<div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
				<div className="flex items-center gap-1">
					<ToolbarButton
						onClick={handleBold}
						icon={Bold}
						title="Bold (Ctrl+B)"
					/>
					<ToolbarButton
						onClick={handleItalic}
						icon={Italic}
						title="Italic (Ctrl+I)"
					/>
					<div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
					<ToolbarButton
						onClick={handleList}
						icon={List}
						title="Unordered List"
					/>
					<ToolbarButton
						onClick={handleLink}
						icon={LinkIcon}
						title="Insert Link"
					/>
					<ToolbarButton
						onClick={handleImage}
						icon={ImageIcon}
						title="Insert Image"
					/>
				</div>
				<div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-slate-100 shadow-sm">
					<Type className="w-3.5 h-3.5 text-slate-400" />
					<span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
						Markdown Powered
					</span>
				</div>
			</div>

			{/* Editor Area */}
			<div className="relative group">
				<textarea
					ref={textareaRef}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder={placeholder}
					className="w-full px-8 py-6 bg-white focus:outline-none focus:ring-0 text-slate-700 font-medium leading-relaxed resize-y min-h-[400px] placeholder:text-slate-200 selection:bg-emerald-100 selection:text-emerald-900"
					rows={15}
				/>
				<div className="absolute top-4 right-4 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
					<div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
						<span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
						Live Editing
					</div>
				</div>
			</div>

			{/* Footer / Info Bar */}
			<div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
						<Info className="w-3 h-3" />
					</div>
					<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
						Use <span className="text-slate-900">**bold**</span>,{" "}
						<span className="text-slate-900">*italic*</span> or{" "}
						<span className="text-slate-900">- lists</span> for rich content.
					</p>
				</div>
				<div className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
					Characters: <span className="text-slate-900">{value.length}</span>
				</div>
			</div>
		</div>
	);
};

export default SimpleTextEditor;
