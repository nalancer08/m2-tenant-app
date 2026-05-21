import { useEffect, useRef, useState } from 'react';
import { IconCheck, IconLock, IconX } from '../../../components/icons';
import type { TenantDocumentRow, DocumentType } from '../../../api/tenant-me';
import { tenantMeApi } from '../../../api/tenant-me';
import styles from './FileSlot.module.css';

interface FileSlotProps {
  /** Display label ("INE — frente", "Comprobante 1", etc.). */
  label: string;
  /** Backend document type the upload will be tagged with. */
  type: DocumentType;
  /** Existing uploaded document for this slot, if any. */
  existing: TenantDocumentRow | null;
  /** Whether the password toggle should be shown (turn off for INE/selfie). */
  allowPassword?: boolean;
  /** Required vs optional slot — only affects visual badge. */
  required?: boolean;
  /** Accept attribute hint for the file picker. */
  accept?: string;
  /** Called after a successful upload, password-flag change, or delete. */
  onChange: (doc: TenantDocumentRow | null) => void;
}

/**
 * One upload slot. Two phases of UI:
 *   1. Empty: a tappable card that opens the file picker. Picking the
 *      file immediately triggers the upload — no "Subir archivo"
 *      confirmation step. Cancelling the picker leaves the slot empty.
 *   2. Uploaded: filename + size + check + small ícono X to remove.
 *      The "el archivo tiene contraseña" toggle lives here too (flag-only,
 *      we never store the password itself).
 *
 * Why upload-on-pick: the previous flow had a 2-step picker → preview →
 * "Subir archivo" button which confused users (Erick: "esta padre tener
 * que confirmar la subida, pero no se entiende"). One tap, one upload.
 */
export function FileSlot({
  label,
  type,
  existing,
  allowPassword = false,
  required,
  accept,
  onChange,
}: FileSlotProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  // Local mirror of has_password so the toggle reacts instantly while
  // the PATCH is in flight. Reset whenever the existing doc changes.
  const [pwLocal, setPwLocal] = useState(existing?.has_password ?? false);
  useEffect(() => {
    setPwLocal(existing?.has_password ?? false);
  }, [existing?.id, existing?.has_password]);

  const handlePicked = async (file: File) => {
    setError(null);
    setUploading(true);
    setProgress(0);
    try {
      const doc = await tenantMeApi.uploadDocument({
        file,
        type,
        has_password: false,
        onProgress: setProgress,
      });
      onChange(doc);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'No pudimos subir el archivo.');
    } finally {
      setUploading(false);
      // Allow re-picking the same file (otherwise the input considers it unchanged)
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!existing) return;
    setError(null);
    setRemoving(true);
    try {
      await tenantMeApi.deleteDocument(existing.id);
      onChange(null);
    } catch (err) {
      setError('No pudimos eliminar el archivo.');
      void err;
    } finally {
      setRemoving(false);
    }
  };

  const handlePasswordToggle = async (next: boolean) => {
    if (!existing) return;
    setPwLocal(next);
    try {
      const updated = await tenantMeApi.patchDocument(existing.id, {
        has_password: next,
      });
      onChange(updated);
    } catch (err) {
      // Revert on error
      setPwLocal(existing.has_password);
      setError('No pudimos actualizar el archivo.');
      void err;
    }
  };

  // Uploaded state ────────────────────────────────────────────────
  if (existing) {
    return (
      <div className={`${styles.slot} ${styles.slot_uploaded}`}>
        <div className={styles.uploadedRow}>
          <span className={styles.checkIcon} aria-hidden>
            <IconCheck width={14} height={14} />
          </span>
          <div className={styles.uploadedText}>
            <span className={styles.uploadedLabel}>
              {label}
              {required ? <span className={styles.required}> · obligatorio</span> : null}
            </span>
            <span className={styles.fileName} title={existing.file_name}>
              {existing.file_name}{' '}
              <span className={styles.fileSize}>{formatSize(existing.file_size)}</span>
            </span>
          </div>
          <button
            type="button"
            className={styles.removeIconBtn}
            onClick={handleRemove}
            disabled={removing}
            aria-label="Eliminar archivo"
            title="Eliminar"
          >
            <IconX width={14} height={14} />
          </button>
        </div>

        {allowPassword ? (
          <label className={styles.pwInlineToggle}>
            <input
              type="checkbox"
              checked={pwLocal}
              onChange={(e) => handlePasswordToggle(e.currentTarget.checked)}
            />
            <span className={styles.pwInlineBox} aria-hidden>
              {pwLocal ? <IconCheck width={11} height={11} /> : null}
            </span>
            <span className={styles.pwInlineText}>
              <IconLock width={11} height={11} /> El archivo tiene contraseña
            </span>
          </label>
        ) : null}

        {pwLocal ? (
          <p className={styles.passwordHelp}>
            Por seguridad <strong>no guardamos contraseñas de archivos</strong>.
            Te recomendamos quitarle la contraseña al PDF antes de subirlo. Si
            no puedes, el equipo te contactará por WhatsApp para abrirlo juntos.
          </p>
        ) : null}

        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    );
  }

  // Empty state (or mid-upload) ──────────────────────────────────
  return (
    <>
      <button
        type="button"
        className={styles.pickerBtn}
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <div className={styles.pickerHead}>
          <span className={styles.label}>
            {label}
            {required ? <span className={styles.required}> · obligatorio</span> : null}
          </span>
        </div>
        <span className={styles.pickerHint}>
          {uploading
            ? 'Subiendo…'
            : 'Tocar para elegir archivo (PDF, JPG, PNG · máx 15 MB)'}
        </span>
        {uploading ? (
          <div className={styles.progressTrack} aria-label="Subiendo">
            <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
          </div>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          accept={accept ?? 'application/pdf,image/jpeg,image/png,image/webp,image/heic'}
          style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.currentTarget.files?.[0];
            if (f) void handlePicked(f);
          }}
        />
      </button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </>
  );
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes || !Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
