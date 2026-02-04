'use client';

import { useState, useRef, useEffect } from 'react';
import type { Tag, TagColor } from '@/lib/types';

interface TaskTagsInputProps {
  selectedTags: string[];
  availableTags: Tag[];
  onChange: (tagIds: string[]) => void;
  onCreateTag?: (name: string) => void;
}

const TAG_COLOR_STYLES: Record<TagColor, string> = {
  red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  lime: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  sky: 'bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  violet: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
  purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-200',
  pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
};

export function TaskTagsInput({
  selectedTags,
  availableTags,
  onChange,
  onCreateTag,
}: TaskTagsInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedTagObjects = availableTags.filter((tag) => selectedTags.includes(tag.id));
  const filteredTags = availableTags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchValue.toLowerCase()) &&
      !selectedTags.includes(tag.id)
  );

  const showCreateOption =
    searchValue.trim() !== '' &&
    !availableTags.some((tag) => tag.name.toLowerCase() === searchValue.trim().toLowerCase()) &&
    onCreateTag;

  const handleTagSelect = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onChange(selectedTags.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTags, tagId]);
    }
    setSearchValue('');
    inputRef.current?.focus();
  };

  const handleTagRemove = (tagId: string) => {
    onChange(selectedTags.filter((id) => id !== tagId));
  };

  const handleCreateTag = () => {
    if (onCreateTag && searchValue.trim()) {
      onCreateTag(searchValue.trim());
      setSearchValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && showCreateOption) {
      e.preventDefault();
      handleCreateTag();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedTagObjects.map((tag) => (
          <span
            key={tag.id}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${TAG_COLOR_STYLES[tag.color]}`}
          >
            {tag.name}
            <button
              type="button"
              onClick={() => handleTagRemove(tag.id)}
              className="ml-1 hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
              aria-label={`Eliminar etiqueta ${tag.name}`}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </span>
        ))}
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar o crear tag..."
          className="input"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label="Buscar o crear etiqueta"
          aria-controls="tags-listbox"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (filteredTags.length > 0 || showCreateOption) && (
        <div
          id="tags-listbox"
          className="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-auto"
          role="listbox"
        >
          {filteredTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagSelect(tag.id)}
              className="w-full px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none flex items-center gap-2"
              role="option"
              aria-selected={selectedTags.includes(tag.id)}
            >
              <span
                className={`w-3 h-3 rounded-full ${TAG_COLOR_STYLES[tag.color].split(' ')[0]}`}
                aria-hidden="true"
              />
              <span>{tag.name}</span>
            </button>
          ))}
          {showCreateOption && (
            <button
              type="button"
              onClick={handleCreateTag}
              className="w-full px-3 py-2 text-left hover:bg-muted focus:bg-muted focus:outline-none flex items-center gap-2 text-primary"
            >
              <span aria-hidden="true">+</span>
              <span>Crear &quot;{searchValue.trim()}&quot;</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export { TAG_COLOR_STYLES };
