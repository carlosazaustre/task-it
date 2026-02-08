'use client';

import { useRef, useState } from 'react';
import { Download, Upload, Trash2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface SettingsDataProps {
  onExport: () => void;
  onImport: (file: File) => Promise<boolean>;
  onClearAll: () => void;
}

export function SettingsData({ onExport, onImport, onClearAll }: SettingsDataProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onImport(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section className="bg-card rounded-[24px] p-7 flex flex-col gap-5">
      <h2 className="text-xl font-bold text-foreground font-heading">
        Datos y almacenamiento
      </h2>

      <p className="text-[13px] text-muted-foreground leading-relaxed">
        Tus datos se almacenan localmente en el navegador (localStorage). Puedes
        exportarlos como respaldo o importar datos existentes.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-5 py-3 rounded-[14px]
                     bg-background text-sm font-semibold text-foreground
                     hover:bg-secondary transition-colors"
        >
          <Download className="w-4 h-4" />
          Exportar datos
        </button>

        <button
          onClick={handleImportClick}
          className="flex items-center gap-2 px-5 py-3 rounded-[14px]
                     bg-background text-sm font-semibold text-foreground
                     hover:bg-secondary transition-colors"
        >
          <Upload className="w-4 h-4" />
          Importar datos
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="h-px bg-border" />

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-destructive">
            Borrar todos los datos
          </span>
          <span className="text-xs text-muted-foreground max-w-[500px]">
            Esta accion es irreversible. Se eliminaran todas tus tareas, etiquetas
            y configuracion.
          </span>
        </div>

        <button
          onClick={() => setShowConfirmDelete(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-[14px]
                     bg-destructive/10 text-destructive text-[13px] font-semibold
                     hover:bg-destructive/20 transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Borrar todo
        </button>
      </div>

      <Modal
        isOpen={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title="Borrar todos los datos"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={onClearAll}>
              Borrar todo
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Se eliminaran permanentemente todas tus tareas, etiquetas, configuracion
          de Pomodoro y preferencias. Esta accion no se puede deshacer.
        </p>
      </Modal>
    </section>
  );
}
