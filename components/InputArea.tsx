import React, { useState, useRef, useEffect } from 'react';
import { Image, Type, Mic, Send, StopCircle, CheckCircle, Trash2 } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface InputAreaProps {
  onSubmit: (data: { type: 'image' | 'audio' | 'text', data: File | Blob | string }) => void;
  disabled: boolean;
}

interface ModeButtonProps {
  activeMode: 'image' | 'text' | 'audio';
  targetMode: 'image' | 'text' | 'audio';
  children: React.ReactNode;
  onClick: () => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({
  activeMode,
  targetMode,
  children,
  onClick,
}) => {
  const isActive = activeMode === targetMode;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ${
        isActive
          ? 'bg-green-600 text-white shadow'
          : 'bg-transparent text-gray-600 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
};

const InputArea: React.FC<InputAreaProps> = ({ onSubmit, disabled }) => {
  const [mode, setMode] = useState<'image' | 'text' | 'audio'>('image');

  // Image State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Text State
  const [textInput, setTextInput] = useState('');

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Cleanup URL object when component unmounts or audioUrl changes
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImageSubmit = () => {
    if (imageFile) onSubmit({ type: 'image', data: imageFile });
  };
  
  const handleTextSubmit = () => {
    if (textInput.trim()) onSubmit({ type: 'text', data: textInput.trim() });
  };
  
  const handleAudioSubmit = () => {
    if (audioBlob) onSubmit({ type: 'audio', data: audioBlob });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      
      mediaRecorderRef.current.onstop = () => {
        const newAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(newAudioBlob);
        setAudioUrl(URL.createObjectURL(newAudioBlob));
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      if(audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    } catch (err) {
      console.error("Error al acceder al micrófono:", err);
      alert("No se pudo acceder al micrófono. Por favor, revisa los permisos de tu navegador.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const resetAudio = () => {
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="flex justify-center gap-2 mb-6 p-1 bg-gray-100 rounded-full">
            <ModeButton activeMode={mode} targetMode='image' onClick={() => setMode('image')}><Image size={16} /><span>Imagen</span></ModeButton>
            <ModeButton activeMode={mode} targetMode='text' onClick={() => setMode('text')}><Type size={16} /><span>Texto</span></ModeButton>
            <ModeButton activeMode={mode} targetMode='audio' onClick={() => setMode('audio')}><Mic size={16} /><span>Voz</span></ModeButton>
        </div>
        
        <div className="w-full max-w-lg">
        {mode === 'image' && (
            <ImageUploader 
              onFileChange={handleFileChange}
              imagePreview={imagePreview}
            />
        )}
        
        {mode === 'text' && (
            <div className="w-full">
                <textarea 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Ej: tengo tomates, 2 huevos, queso y albahaca..."
                    className="w-full h-48 p-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition bg-white text-gray-900"
                />
            </div>
        )}

        {mode === 'audio' && (
            <div className="w-full flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border-2 border-gray-200">
                {!isRecording && !audioBlob && (
                    <>
                        <Mic className="h-16 w-16 mb-4 text-gray-400" />
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Describe tus ingredientes</h2>
                        <p className="text-gray-500 mb-6">Presiona el botón para empezar a grabar.</p>
                        <button type="button" onClick={startRecording} disabled={disabled} className="px-6 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 flex items-center gap-2">
                            <Mic size={20} /> Grabar
                        </button>
                    </>
                )}
                {isRecording && (
                    <>
                        <div className="relative h-16 w-16 mb-4">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse"></div>
                            <Mic className="relative h-16 w-16 p-3 text-white" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-6">Grabando...</h2>
                        <button type="button" onClick={stopRecording} className="px-6 py-3 bg-gray-700 text-white font-bold rounded-full shadow-lg hover:bg-gray-800 flex items-center gap-2">
                             <StopCircle size={20} /> Detener
                        </button>
                    </>
                )}
                {audioUrl && audioBlob && (
                    <div className="w-full flex flex-col items-center">
                        <CheckCircle className="h-12 w-12 mb-3 text-green-500" />
                         <h2 className="text-xl font-semibold text-gray-700 mb-4">¡Grabación Lista!</h2>
                        <audio src={audioUrl} controls className="w-full mb-4"/>
                        <div className="flex gap-4">
                            <button type="button" onClick={resetAudio} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-full hover:bg-gray-300 flex items-center gap-2"><Trash2 size={16}/> Descartar</button>
                        </div>
                    </div>
                )}
            </div>
        )}
        </div>

        <div className="mt-8">
            {mode === 'image' && <button type="button" onClick={handleImageSubmit} disabled={!imageFile || disabled} className="px-8 py-4 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-3"><Image size={20}/> Buscar Recetas con Imagen</button>}
            {mode === 'text' && <button type="button" onClick={handleTextSubmit} disabled={!textInput.trim() || disabled} className="px-8 py-4 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-3"><Send size={20}/> Buscar Recetas con Texto</button>}
            {mode === 'audio' && <button type="button" onClick={handleAudioSubmit} disabled={!audioBlob || disabled} className="px-8 py-4 bg-green-600 text-white font-bold rounded-full shadow-lg hover:bg-green-700 transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-3"><Send size={20}/> Buscar Recetas con Voz</button>}
        </div>

    </div>
  );
};

export default InputArea;
