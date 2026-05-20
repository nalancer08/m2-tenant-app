import { useRef, useState } from 'react';
import { IconCheck, IconLock, IconX } from '../../../components/icons';
import { Field } from '../../../components/primitives/Field';
import { Button } from '../../../components/primitives/Button';
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
  /** Called after a successful upload or delete with the latest doc (or null). */
  onChange: (doc: TenantDocumentRow | null) => void;
}

/**
 * One upload slot. Three phases of UI:
 *   1. Empty: a tappable card that opens the file picker.
 *   2. File picked, not yet uploaded: filename preview + password toggle +
 *      (when has_password=true) password input + "Subir" button.
 *   3. Uploaded: filename + size + check icon + remove button.
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
  const [picked, setPicked] = useState<File | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (existing) {
    return (
      <div className={`${styles.slot} ${styles.slot_uploaded}`}>
        <div className={styles.slotHead}>
          <span className={styles.label}>
            {label}
            {required ? <span className={styles.required}> · obligatorio</span> : null}
          </span>
          <span className={styles.checkIcon} aria-hidden>
            <IconCheck width={14} height={14} />
          </span>
        </div>
        <div className={styles.uploadedRow}>
          <span className={styles.fileName} title={existing.file_name}>
            {existing.file_name}
          </span>
          <span className={styles.fileSize}>{formatSize(existing.file_size)}</span>
        </div>
        {existing.has_password ? (
          <p className={styles.passwordTag}>
            <IconLock width={12} height={12} /> Archivo con contraseña guardada
          </p>
        ) : null}
        <button
          type="button"
          className={styles.removeBtn}
          onClick={async () => {
            try {
              await tenantMeApi.deleteDocument(existing.id);
              onChange(null);
            } catch (err) {
              setError('No pudimos eliminar el archivo.');
              void err;
            }
          }}
        >
          <IconX width={14} height={14} /> Eliminar
        </button>
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    );
  }

  if (picked) {
    return (
      <div className={styles.slot}>
        <div className={styles.slotHead}>
          <span className={styles.label}>
            {label}
            {required ? <span className={styles.required}> · obligatorio</span> : null}
          </span>
        </div>
        <div className={styles.previewRow}>
          <span className={styles.fileName} title={picked.name}>
            {picked.name}
          </span>
          <button
            type="button"
            className={styles.linkBtn}
            onClick={() => {
              setPicked(null);
              setError(null);
            }}
          >
            Cambiar
          </button>
        </div>

        {allowPassword ? (
          <div className={styles.passwordSection}>
            <label className={styles.passwordToggle}>
              <input
                type="checkbox"
                checked={hasPassword}
                onChange={(e) => setHasPassword(e.currentTarget.checked)}
              />
              <span className={styles.passwordToggleBox} aria-hidden>
                {hasPassword ? <IconCheck width={12} height={12} /> : null}
              </span>
              <span className={styles.passwordToggleText}>
                El archivo tiene contraseña
              </span>
            </label>
            {hasPassword ? (
              <Field
                label="Contraseña del archivo"
                type="password"
                autoComplete="off"
                placeholder="La que necesitamos para abrirlo"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                hint="La guardamos cifrada con AES-256. Solo se usa para que la investigación abra el documento."
              />
            ) : null}
          </div>
        ) : null}

        {uploading ? (
          <div className={styles.progressTrack} aria-label="Subiendo">
            <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
          </div>
        ) : null}

        {error ? <p className={styles.error}>{error}</p> : null}

        <Button
          fullWidth
          loading={uploading}
          disabled={uploading || (hasPassword && !password)}
          onClick={async () => {
            setError(null);
            setUploading(true);
            setProgress(0);
            try {
              const doc = await tenantMeApi.uploadDocument({
                file: picked,
                type,
                has_password: hasPassword,
                password: hasPassword ? password : undefined,
                onProgress: setProgress,
              });
              setPicked(null);
              setHasPassword(false);
              setPassword('');
              onChange(doc);
            } catch (err) {
              const e = err as { response?: { data?: { message?: string } } };
              setError(e.response?.data?.message ?? 'No pudimos subir el archivo.');
            } finally {
              setUploading(false);
            }
          }}
        >
          Subir archivo
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={styles.pickerBtn}
      onClick={() => inputRef.current?.click()}
    >
      <div className={styles.pickerHead}>
        <span className={styles.label}>
          {label}
          {required ? <span className={styles.required}> · obligatorio</span> : null}
        </span>
      </div>
      <span className={styles.pickerHint}>Tocar para elegir archivo (PDF, JPG, PNG · máx 15 MB)</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept ?? 'application/pdf,image/jpeg,image/png,image/webp,image/heic'}
        style={{ display: 'none' }}
        onChange={(e) => {
          const f = e.currentTarget.files?.[0];
          if (f) setPicked(f);
        }}
      />
    </button>
  );
}

function formatSize(bytes: number | null | undefined): string {
  if (!bytes || !Number.isFinite(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
