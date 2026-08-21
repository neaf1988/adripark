import { useRef, useState } from 'react';
import { compressImage } from '@/utils/compressImage';
import { Button } from './Button';

interface PhotoCaptureProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoCapture({ photos, onChange, maxPhotos = 3 }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      onChange([...photos, compressed]);
    } catch {
      setError('No se pudo procesar la foto');
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <p className="text-base font-medium text-gray-700">Fotos del vehículo</p>

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
              <img src={photo} alt={`Foto ${index + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-danger text-sm font-bold text-white"
                aria-label="Eliminar foto"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="secondary"
            fullWidth
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            {loading ? 'Procesando...' : '📷 Tomar / adjuntar foto'}
          </Button>
        </>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
