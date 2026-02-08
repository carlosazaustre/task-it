'use client';

import { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ReadOnlyField } from '@/components/ui/ReadOnlyField';
import { LANGUAGE_OPTIONS } from '@/lib/constants';
import type { UserProfile } from '@/lib/types';

interface SettingsProfileProps {
  profile: UserProfile;
  onUpdate: (data: Partial<UserProfile>) => void;
}

export function SettingsProfile({ profile, onUpdate }: SettingsProfileProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const handleEdit = () => {
    setDraft(profile);
    setEditing(true);
  };

  const handleSave = () => {
    onUpdate(draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(profile);
    setEditing(false);
  };

  return (
    <section className="bg-card rounded-[24px] p-7 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground font-heading">Perfil</h2>
        <div className="flex items-center gap-2">
          {editing && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[14px]
                         text-sm font-semibold text-muted-foreground
                         hover:bg-secondary transition-colors"
              aria-label="Cancelar edición"
            >
              <X className="w-3.5 h-3.5" />
              Cancelar
            </button>
          )}
          <button
            onClick={editing ? handleSave : handleEdit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[14px]
                       text-sm font-semibold text-muted-foreground
                       hover:bg-secondary transition-colors"
            aria-label={editing ? 'Guardar cambios' : 'Editar perfil'}
          >
            {editing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Guardar
              </>
            ) : (
              <>
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content: Avatar + Fields */}
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-[28px] font-bold text-white">
            {profile.initials}
          </span>
        </div>

        {/* Fields grid 2 columnas */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {editing ? (
            <>
              <Input
                label="Nombre"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
              <Input
                label="Rol"
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              />
              <Select
                label="Idioma"
                options={LANGUAGE_OPTIONS}
                value={draft.language}
                onChange={(e) =>
                  setDraft({ ...draft, language: e.target.value as 'es' | 'en' })
                }
              />
            </>
          ) : (
            <>
              <ReadOnlyField label="Nombre" value={profile.name || '—'} />
              <ReadOnlyField label="Email" value={profile.email || '—'} />
              <ReadOnlyField label="Rol" value={profile.role || '—'} />
              <ReadOnlyField
                label="Idioma"
                value={
                  LANGUAGE_OPTIONS.find((o) => o.value === profile.language)?.label ||
                  profile.language
                }
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
