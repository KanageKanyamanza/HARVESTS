import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, List, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

const SimpleTextEditor = ({
  value = '',
  onChange,
  placeholder = 'Rédigez votre contenu...',
  className = '',
  editorId = 'simple-editor'
}) => {
  const textareaRef = useRef(null);

  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restaurer la position du curseur
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const handleBold = () => {
    insertText('**', '**');
  };

  const handleItalic = () => {
    insertText('*', '*');
  };

  const handleList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', start);
    const line = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd);

    if (line.trim().startsWith('- ')) {
      // Retirer le formatage de liste
      const newText = value.substring(0, lineStart) + line.replace(/^-\s+/, '') + value.substring(lineEnd === -1 ? value.length : lineEnd);
      onChange(newText);
    } else {
      // Ajouter le formatage de liste
      const newText = value.substring(0, lineStart) + '- ' + line + value.substring(lineEnd === -1 ? value.length : lineEnd);
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
      insertText('[', `](url)`);
    } else {
      insertText('[texte du lien](url)', '');
    }
  };

  const handleImage = () => {
    insertText('![alt text](image-url)', '');
  };

  return (
    <div className={`border border-gray-300 rounded-md ${className}`}>
      {/* Barre d'outils */}
      <div className="flex items-center space-x-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
        <button
          type="button"
          onClick={handleBold}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded"
          title="Gras"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleItalic}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded"
          title="Italique"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleList}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded"
          title="Liste"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded"
          title="Lien"
        >
          <LinkIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleImage}
          className="p-2 text-gray-600 hover:bg-gray-200 rounded"
          title="Image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Zone de texte */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-b-md resize-y min-h-[300px]"
        rows={15}
      />

      {/* Aide markdown */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 rounded-b-md text-xs text-gray-500">
        <strong>Astuce:</strong> Utilisez la syntaxe Markdown. <strong>**gras**</strong>, <em>*italique*</em>, <code>- liste</code>
      </div>
    </div>
  );
};

export default SimpleTextEditor;

