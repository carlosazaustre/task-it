'use client';

import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Tag, TagFormData } from '@/lib/types';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * Generate a unique ID for tags.
 * Uses crypto.randomUUID if available, falls back to timestamp-based ID.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Default tags to use as initial value if localStorage is empty.
 * Note: These have fixed IDs to ensure consistency across SSR/client hydration.
 */
const DEFAULT_TAGS: Tag[] = [
  { id: 'default-tag-trabajo', name: 'Trabajo', color: 'blue' },
  { id: 'default-tag-personal', name: 'Personal', color: 'green' },
  { id: 'default-tag-urgente', name: 'Urgente', color: 'red' },
  { id: 'default-tag-reunion', name: 'Reunión', color: 'purple' },
  { id: 'default-tag-idea', name: 'Idea', color: 'amber' },
];

/**
 * Hook for CRUD operations on tags with localStorage persistence.
 */
export function useTags() {
  // Use DEFAULT_TAGS as initial value - this will be used if localStorage is empty
  const [tags, setTags] = useLocalStorage<Tag[]>(STORAGE_KEYS.TAGS, DEFAULT_TAGS);

  // isLoading is derived from whether we're on the client
  const isLoading = typeof window === 'undefined';

  /**
   * Add a new tag.
   * Validates that the name is unique (case-insensitive).
   */
  const addTag = useCallback(
    (data: TagFormData): Tag => {
      // Check for duplicate name (case-insensitive)
      const nameExists = tags.some(
        (tag) => tag.name.toLowerCase() === data.name.toLowerCase()
      );

      if (nameExists) {
        throw new Error(`A tag with the name "${data.name}" already exists`);
      }

      const newTag: Tag = {
        id: generateId(),
        ...data,
      };

      setTags((prev) => [...prev, newTag]);
      return newTag;
    },
    [tags, setTags]
  );

  /**
   * Update an existing tag.
   * Returns the updated tag or null if not found.
   */
  const updateTag = useCallback(
    (id: string, data: Partial<TagFormData>): Tag | null => {
      let updatedTag: Tag | null = null;

      // If updating name, check for duplicates (case-insensitive, excluding current tag)
      if (data.name) {
        const nameExists = tags.some(
          (tag) =>
            tag.id !== id &&
            tag.name.toLowerCase() === data.name!.toLowerCase()
        );

        if (nameExists) {
          throw new Error(`A tag with the name "${data.name}" already exists`);
        }
      }

      setTags((prev) => {
        const index = prev.findIndex((tag) => tag.id === id);
        if (index === -1) {
          return prev;
        }

        const updated: Tag = {
          ...prev[index],
          ...data,
        };
        updatedTag = updated;

        const newTags = [...prev];
        newTags[index] = updated;
        return newTags;
      });

      return updatedTag;
    },
    [tags, setTags]
  );

  /**
   * Delete a tag by ID.
   * Returns true if deleted, false if not found.
   * Note: Does not remove tag references from tasks.
   */
  const deleteTag = useCallback(
    (id: string): boolean => {
      let deleted = false;

      setTags((prev) => {
        const index = prev.findIndex((tag) => tag.id === id);
        if (index === -1) {
          return prev;
        }

        deleted = true;
        return prev.filter((tag) => tag.id !== id);
      });

      return deleted;
    },
    [setTags]
  );

  /**
   * Get a tag by ID.
   */
  const getTag = useCallback(
    (id: string): Tag | undefined => {
      return tags.find((tag) => tag.id === id);
    },
    [tags]
  );

  /**
   * Get multiple tags by their IDs.
   * Silently filters out IDs that don't exist.
   */
  const getTagsByIds = useCallback(
    (ids: string[]): Tag[] => {
      return ids
        .map((id) => tags.find((tag) => tag.id === id))
        .filter((tag): tag is Tag => tag !== undefined);
    },
    [tags]
  );

  // Memoize return object to maintain referential stability
  return useMemo(
    () => ({
      tags,
      isLoading,
      addTag,
      updateTag,
      deleteTag,
      getTag,
      getTagsByIds,
    }),
    [tags, isLoading, addTag, updateTag, deleteTag, getTag, getTagsByIds]
  );
}
