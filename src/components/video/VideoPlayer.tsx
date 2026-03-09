import React, { useState } from 'react';
import { Play, VideoOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VideoPlayerProps {
  videoUrl?: string;
  exerciseName: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, exerciseName }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!videoUrl) {
    return (
      <div 
        className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#B0E0E6' }}
        title="No video available"
      >
        <VideoOff className="w-5 h-5 text-black/50 mb-0.5" />
        <span className="text-[9px] font-medium text-black/60 leading-tight text-center px-1">No Video</span>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-black relative group overflow-hidden flex-shrink-0 shadow-sm border border-border transition-transform hover:scale-105"
        aria-label={`Play video for ${exerciseName}`}
      >
        {/* Fake Thumbnail Background */}
        <div className="absolute inset-0 bg-muted/20 bg-cover bg-center" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"><rect width="100%" height="100%" fill="%232D3748"/><circle cx="50%" cy="50%" r="20" fill="%23FF69B4" opacity="0.8"/></svg>')`}} />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
          <Play className="w-6 h-6 text-white drop-shadow-md group-hover:scale-110 transition-transform" fill="currentColor" />
        </div>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-3xl p-0 bg-black border-border shadow-2xl overflow-hidden rounded-xl">
          <DialogHeader className="p-4 py-3 bg-card border-b border-border">
            <DialogTitle className="text-foreground text-left">{exerciseName}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            {isOpen && (
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                playsInline
                className="w-full h-full object-contain"
                aria-label={`Video demonstration of ${exerciseName}`}
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VideoPlayer;
