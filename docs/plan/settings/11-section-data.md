# Spec 11: Seccion Datos y Almacenamiento

**Archivo:** `components/settings/SettingsData.tsx` (NUEVO)
**Accion:** Crear
**Dependencias:** 05-hook-useSettings
**Bloquea:** 12-orchestrator

---

## Referencia visual (del diseno Settings V3)

- Card con `bg-card rounded-[24px] p-7`
- Titulo "Datos y almacenamiento" (Plus Jakarta Sans 20px bold)
- Texto descriptivo: "Tus datos se almacenan localmente en el navegador (localStorage). Puedes exportarlos como respaldo o importar datos existentes."
- 2 botones en fila horizontal:
  - **Exportar datos** (icono download, bg-background, texto foreground, rounded-[14px])
  - **Importar datos** (icono upload, bg-background, texto foreground, rounded-[14px])
- Linea divisoria (1px border)
- Zona de peligro:
  - Texto "Borrar todos los datos" en rojo (destructive)
  - Descripcion "Esta accion es irreversible. Se eliminaran todas tus tareas, etiquetas y configuracion."
  - Boton "Borrar todo" (fondo rojo/10, texto rojo, icono trash-2)

## Comportamiento

- **Exportar**: Descarga un archivo JSON con todos los datos de localStorage
- **Importar**: Abre un file input, lee el JSON y restaura los datos. Recarga la pagina
- **Borrar todo**: Muestra dialogo de confirmacion. Si confirma, borra todas las claves de localStorage y recarga
- Todas las funciones vienen del hook `useSettings()`

## Implementacion

```tsx
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
    // Reset input
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

      {/* Action buttons */}
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

      {/* Divider */}
      <div className="h-px bg-border" />

      {/* Danger zone */}
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
          className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-[14px]
                     bg-destructive/10 text-destructive text-[13px] font-semibold
                     hover:bg-destructive/20 transition-colors flex-shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Borrar todo
        </button>
      </div>

      {/* Confirm delete modal */}
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
```

## Verificacion

- Boton "Exportar" descarga un archivo JSON
- Boton "Importar" abre selector de archivo, importa el JSON y recarga
- Boton "Borrar todo" muestra modal de confirmacion
- Al confirmar, se borran todos los datos y se recarga la pagina
- Los botones de accion tienen los estilos correctos del diseno
