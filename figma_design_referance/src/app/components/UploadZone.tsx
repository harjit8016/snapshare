import { useCallback, useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
}

export function UploadZone({ onUpload, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      onUpload(files);
    }
  }, [onUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      onUpload(files);
    }
  }, [onUpload]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center transition-all
          ${isDragging 
            ? 'border-purple-500 bg-purple-50' 
            : 'border-gray-300 bg-gray-50 hover:border-purple-400 hover:bg-purple-25'
          }
          ${disabled ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-20 h-20 rounded-full flex items-center justify-center transition-colors
            ${isDragging ? 'bg-purple-500' : 'bg-purple-100'}
          `}>
            <Upload className={`w-10 h-10 ${isDragging ? 'text-white' : 'text-purple-600'}`} />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Drop your images here
            </h2>
            <p className="text-gray-600 mb-4">
              or click the button below to browse
            </p>
          </div>
          
          <Button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
            disabled={disabled}
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            Choose Images
          </Button>
          
          <p className="text-sm text-gray-500 mt-2">
            Supports: JPG, PNG, GIF, WebP
          </p>
        </div>
      </div>
    </div>
  );
}