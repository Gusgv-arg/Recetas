import React, { useRef } from 'react';
import { Image, CheckCircle } from 'lucide-react';

interface ImageUploaderProps {
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  imagePreview: string | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileChange, imagePreview }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div
      className={`relative w-full border-2 border-dashed rounded-xl p-8 transition-colors duration-300 ${
        imagePreview ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'
      }`}
    >
      <input type="file" accept="image/*" onChange={onFileChange} className="hidden" ref={fileInputRef} />
      {imagePreview ? (
        <div>
          <img src={imagePreview} alt="Vista previa" className="max-h-60 w-auto mx-auto rounded-lg shadow-md" />
          <div className="mt-4 flex items-center justify-center text-green-700">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p className="font-medium">¡Imagen seleccionada!</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center text-gray-500 cursor-pointer" onClick={triggerFileSelect}>
          <Image className="h-16 w-16 mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-700">Fotografía tu Heladera</h2>
          <p>Haz clic para subir una foto de tus ingredientes.</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
