import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen = ({ onComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 text-center space-y-8 px-4">
        <div className="relative">
          <div className="text-7xl md:text-9xl font-bold gradient-purple bg-clip-text text-transparent animate-scale-in">
            🎰
          </div>
          <div className="absolute inset-0 animate-ping opacity-20">
            <div className="text-7xl md:text-9xl">🎰</div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold gradient-purple bg-clip-text text-transparent animate-fade-in">
            SlotsFight
          </h1>
          <p className="text-muted-foreground text-lg animate-fade-in delay-200">
            Загрузка игрового мира...
          </p>
        </div>

        <div className="w-full max-w-md mx-auto space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-secondary to-accent transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-muted-foreground animate-fade-in">{progress}%</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
