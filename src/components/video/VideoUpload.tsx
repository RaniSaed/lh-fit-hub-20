import React, { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { UploadCloud, CheckCircle2, X } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoUploadProps {
  videoUrl: string;
  onChange: (url: string) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ videoUrl, onChange }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          const fakeBlobUrl = URL.createObjectURL(file);
          onChange(fakeBlobUrl);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200); // 200ms * 10 steps = 2 seconds
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full text-sm">
      <AnimatePresence mode="wait">
        {videoUrl ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center justify-between p-2 rounded-lg border border-green-200 bg-green-50"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              <span className="text-sm text-green-700 truncate">{t('uploadSuccess')}</span>
            </div>
            <button
              onClick={() => onChange('')}
              className="text-muted-foreground hover:text-destructive p-1 rounded-md hover:bg-black/5 transition-colors"
              title="Remove video"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : isUploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 border-2 border-dashed border-[#B0E0E6] rounded-lg bg-[#B0E0E6]/10 flex flex-col justify-center gap-2 h-full"
          >
             <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
             </div>
             <Progress value={uploadProgress} className="h-2" />
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`relative p-3 border-2 border-dashed rounded-lg transition-colors cursor-pointer group flex flex-col items-center justify-center text-center gap-2 h-full min-h-[80px]
              ${isDragging ? 'border-[#FF69B4] bg-[#FF69B4]/10' : 'border-[#B0E0E6] bg-[#B0E0E6]/5 hover:bg-[#B0E0E6]/10'}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="video/mp4,video/quicktime"
              onChange={handleFileChange}
            />
            <UploadCloud className={`w-5 h-5 transition-colors ${isDragging ? 'text-[#FF69B4]' : 'text-[#FF69B4]/70 group-hover:text-[#FF69B4]'}`} />
            <p className="text-xs text-muted-foreground max-w-[120px] leading-tight group-hover:text-foreground transition-colors">
              {t('dragDropVideo')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoUpload;
