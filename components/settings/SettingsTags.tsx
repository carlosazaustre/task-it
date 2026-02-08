'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TAG_COLORS, TAG_COLOR_CLASS } from '@/lib/constants';
import type { Tag, TagColor, TagFormData } from '@/lib/types';
import { cn } from '@/lib/utils';

export function SettingsTags() {
  const { tags, addTag, updateTag, deleteTag } = useTags();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingTag(null);
    setModalOpen(true);
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTag(id);
    setConfirmDeleteId(null);
  };

  const handleSave = (data: TagFormData) => {
    if (editingTag) {
      updateTag(editingTag.id, data);
    } else {
      addTag(data);
    }
    setModalOpen(false);
  };

  return (
    <section className="bg-card rounded-[24px] p-7 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-heading">
          Etiquetas
        </h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-[14px]
                     bg-primary/10 text-primary text-[13px] font-semibold
                     hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva etiqueta
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {tags.map((tag) => (
          <div
            key={tag.id}
            className="flex items-center justify-between px-4 py-2.5
                       rounded-[14px] bg-background"
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'w-3 h-3 rounded-[6px]',
                  TAG_COLOR_CLASS[tag.color]
                )}
              />
              <span className="text-sm font-medium text-foreground">
                {tag.name}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(tag)}
                className="p-1 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                aria-label={`Editar ${tag.name}`}
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              {confirmDeleteId === tag.id ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="text-xs text-destructive font-medium"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(null)}
                    className="text-xs text-muted-foreground"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDeleteId(tag.id)}
                  className="p-1 text-muted-foreground/60 hover:text-destructive transition-colors"
                  aria-label={`Eliminar ${tag.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <TagFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editingTag}
      />
    </section>
  );
}

function TagFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TagFormData) => void;
  initialData: Tag | null;
}) {
  // Initialize form state based on initialData (add/edit logic)
  // Using a key on Modal below forces remount which resets component state
  const [name, setName] = useState(initialData?.name || '');
  const [color, setColor] = useState<TagColor>(initialData?.color || 'blue');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), color });
  };

  const handleClose = () => {
    setName('');
    setColor('blue');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={initialData ? 'Editar etiqueta' : 'Nueva etiqueta'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la etiqueta"
          maxLength={20}
        />

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-foreground">Color</span>
          <div className="flex flex-wrap gap-2">
            {TAG_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-7 h-7 rounded-full transition-all',
                  TAG_COLOR_CLASS[c],
                  color === c
                    ? 'ring-2 ring-offset-2 ring-primary'
                    : 'hover:scale-110'
                )}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            {initialData ? 'Guardar' : 'Crear'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
