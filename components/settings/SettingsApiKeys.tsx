'use client';

import { useState, useEffect, useCallback } from 'react';
import { Key, Plus, Trash2, Copy, Check, AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ApiKeyListItem, ApiKeyCreated } from '@/lib/types';

export function SettingsApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [creating, setCreating] = useState(false);

  // Created key state (shown once)
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<ApiKeyListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/api-keys');
      if (!res.ok) throw new Error('Error al cargar las API keys');
      const json = await res.json();
      setApiKeys(json.data);
      setError(null);
    } catch {
      setError('No se pudieron cargar las API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKeys();
  }, [fetchApiKeys]);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;

    try {
      setCreating(true);
      const res = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Error al crear la API key');
      }

      const json = await res.json();
      setCreatedKey(json.data);
      setShowCreateModal(false);
      setNewKeyName('');
      fetchApiKeys();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la API key');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      const res = await fetch(`/api/v1/api-keys/${deleteTarget.id}`, {
        method: 'DELETE',
      });

      if (!res.ok && res.status !== 204) {
        throw new Error('Error al revocar la API key');
      }

      setDeleteTarget(null);
      fetchApiKeys();
    } catch {
      setError('Error al revocar la API key');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatLastUsed = (dateStr: string | null) => {
    if (!dateStr) return 'Nunca';
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="bg-card rounded-[24px] p-7 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-xl font-bold text-foreground font-heading">
            API Keys
          </h2>
          <p className="text-[13px] text-muted-foreground">
            Gestiona las claves de acceso para integraciones externas y Claude Code
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-[14px]
                     bg-primary text-white text-[13px] font-semibold
                     hover:bg-primary/90 transition-colors flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          Nueva clave
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-[14px] bg-destructive/10 text-destructive text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* API Keys List */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
            <Key className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              No hay API keys
            </span>
            <span className="text-xs text-muted-foreground max-w-[280px]">
              Crea una API key para conectar con Claude Code u otras integraciones
            </span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {apiKeys.map((ak) => (
            <div
              key={ak.id}
              className="flex items-center justify-between p-4 rounded-[14px] bg-background
                         border border-border/50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Key className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {ak.name}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <code className="font-mono bg-secondary px-1.5 py-0.5 rounded-md">
                      {ak.keyPreview}
                    </code>
                    <span>Creada {formatDate(ak.createdAt)}</span>
                    <span>Ultimo uso: {formatLastUsed(ak.lastUsed)}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDeleteTarget(ak)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-[10px]
                           text-destructive/70 text-xs font-medium
                           hover:bg-destructive/10 hover:text-destructive transition-colors flex-shrink-0"
              >
                <Trash2 className="w-3 h-3" />
                Revocar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Configuration instructions */}
      <div className="h-px bg-border" />
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-foreground">
          Configuracion para Claude Code
        </h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Para conectar Task-It con Claude Code, agrega esta configuracion a tu
          archivo <code className="font-mono bg-secondary px-1.5 py-0.5 rounded-md text-foreground">claude_desktop_config.json</code>:
        </p>
        <pre className="p-4 rounded-[14px] bg-background border border-border/50 text-xs font-mono text-foreground overflow-x-auto">
{`{
  "mcpServers": {
    "task-it": {
      "url": "http://localhost:3000/api/mcp",
      "headers": {
        "Authorization": "Bearer <TU_API_KEY>"
      }
    }
  }
}`}
        </pre>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setNewKeyName('');
        }}
        title="Crear nueva API Key"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                setNewKeyName('');
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              isLoading={creating}
              disabled={!newKeyName.trim()}
            >
              Crear clave
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Dale un nombre descriptivo a tu API key para identificarla facilmente.
          </p>
          <Input
            label="Nombre"
            placeholder="Ej: Claude Code, MCP Server"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newKeyName.trim()) handleCreate();
            }}
          />
        </div>
      </Modal>

      {/* Created Key Modal (shown once) */}
      <Modal
        isOpen={!!createdKey}
        onClose={() => setCreatedKey(null)}
        title="API Key creada"
        size="md"
        closeOnBackdrop={false}
        footer={
          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setCreatedKey(null)}>
              Entendido
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-2 p-3 rounded-[14px] bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-sm">
              Copia esta clave ahora. No podras verla de nuevo.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-foreground">
              {createdKey?.name}
            </label>
            <div className="flex items-center gap-2">
              <code
                className="flex-1 p-3 rounded-[14px] bg-secondary font-mono text-sm
                           text-foreground break-all select-all"
              >
                {createdKey?.key}
              </code>
              <button
                onClick={() => createdKey && handleCopy(createdKey.key)}
                className="flex items-center justify-center w-10 h-10 rounded-[14px]
                           bg-secondary text-muted-foreground hover:text-foreground
                           transition-colors flex-shrink-0"
                aria-label="Copiar API key"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Revocar API Key"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Revocar
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          La API key <strong className="text-foreground">{deleteTarget?.name}</strong> sera
          revocada permanentemente. Cualquier integracion que la use dejara de
          funcionar.
        </p>
      </Modal>
    </section>
  );
}
