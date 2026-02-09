'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { api, ApiError } from '@/lib/api-client';
import type { ApiTag } from '@/lib/api-client';
import type { Tag, TagFormData } from '@/lib/types';

/**
 * Generate a temporary ID for optimistic updates.
 */
function generateTempId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `temp-${crypto.randomUUID()}`;
  }
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Map API tag response to frontend Tag type.
 */
function mapApiTag(apiTag: ApiTag): Tag {
  return {
    id: apiTag.id,
    name: apiTag.name,
    color: apiTag.color as Tag['color'],
  };
}

/**
 * Hook for CRUD operations on tags with API persistence.
 * Maintains the same public interface as the localStorage version.
 */
export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  /**
   * Fetch all tags from the API.
   */
  const fetchTags = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.getTags();
      const mapped = (response as ApiTag[]).map(mapApiTag);
      setTags(mapped);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Error al cargar etiquetas';
      setError(message);
      console.error('Error fetching tags:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refetch tags from API.
   */
  const refetch = useCallback(() => {
    return fetchTags();
  }, [fetchTags]);

  // Fetch tags on mount
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchTags();
    }
  }, [fetchTags]);

  /**
   * Add a new tag with optimistic update.
   * Validates that the name is unique (case-insensitive) locally before sending.
   */
  const addTag = useCallback(
    async (data: TagFormData): Promise<Tag> => {
      // Check for duplicate name (case-insensitive) locally
      const nameExists = tags.some(
        (tag) => tag.name.toLowerCase() === data.name.toLowerCase()
      );

      if (nameExists) {
        throw new Error(`A tag with the name "${data.name}" already exists`);
      }

      const tempId = generateTempId();
      const tempTag: Tag = {
        id: tempId,
        ...data,
      };

      // Optimistic: add temp tag
      setTags((prev) => [...prev, tempTag]);

      try {
        const apiResponse = await api.createTag(data);
        const newTag = mapApiTag(apiResponse);

        // Replace temp tag with real one
        setTags((prev) =>
          prev.map((t) => (t.id === tempId ? newTag : t))
        );

        return newTag;
      } catch (err) {
        // Revert optimistic update
        setTags((prev) => prev.filter((t) => t.id !== tempId));
        const message =
          err instanceof ApiError ? err.message : 'Error al crear etiqueta';
        setError(message);
        throw err;
      }
    },
    [tags]
  );

  /**
   * Update an existing tag with optimistic update.
   * Returns the updated tag or null if not found.
   */
  const updateTag = useCallback(
    async (id: string, data: Partial<TagFormData>): Promise<Tag | null> => {
      const tagIndex = tags.findIndex((t) => t.id === id);
      if (tagIndex === -1) return null;

      // If updating name, check for duplicates locally
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

      const previousTag = tags[tagIndex];
      const optimisticTag: Tag = {
        ...previousTag,
        ...data,
      };

      // Optimistic update
      setTags((prev) =>
        prev.map((t) => (t.id === id ? optimisticTag : t))
      );

      try {
        const apiResponse = await api.updateTag(id, data);
        const updatedTag = mapApiTag(apiResponse);

        // Replace with real API response
        setTags((prev) =>
          prev.map((t) => (t.id === id ? updatedTag : t))
        );

        return updatedTag;
      } catch (err) {
        // Revert to previous state
        setTags((prev) =>
          prev.map((t) => (t.id === id ? previousTag : t))
        );
        const message =
          err instanceof ApiError ? err.message : 'Error al actualizar etiqueta';
        setError(message);
        throw err;
      }
    },
    [tags]
  );

  /**
   * Delete a tag by ID with optimistic update.
   * Returns true if deleted, false if not found.
   */
  const deleteTag = useCallback(
    async (id: string): Promise<boolean> => {
      const tagIndex = tags.findIndex((t) => t.id === id);
      if (tagIndex === -1) return false;

      const previousTags = [...tags];

      // Optimistic removal
      setTags((prev) => prev.filter((t) => t.id !== id));

      try {
        await api.deleteTag(id);
        return true;
      } catch (err) {
        // Revert
        setTags(previousTags);
        const message =
          err instanceof ApiError ? err.message : 'Error al eliminar etiqueta';
        setError(message);
        throw err;
      }
    },
    [tags]
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
      error,
      addTag,
      updateTag,
      deleteTag,
      getTag,
      getTagsByIds,
      refetch,
    }),
    [tags, isLoading, error, addTag, updateTag, deleteTag, getTag, getTagsByIds, refetch]
  );
}
