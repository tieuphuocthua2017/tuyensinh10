import React from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  seconds: number;
  totalSeconds: number;
}

const Timer: React.FC<TimerProps> = ({ seconds, totalSeconds }) => {
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const percent = (seconds / totalSeconds) * 100;
  
  // Color logic
  let colorClass = 'text-blue-600';
  if (percent < 20) colorClass = 'text-red-600';
  else if (percent < 50) colorClass = 'text-yellow-600';

  return (
    <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
      <div className="flex items-center gap-2 font-bold text-xl font-mono">
        <Clock className={`w-6 h-6 ${colorClass}`} />
        <span className={colorClass}>{formatTime(seconds)}</span>
      </div>
      <div className="hidden sm:block text-sm text-gray-500 font-medium">
        Đề thi tuyển sinh vào lớp 10 - Môn Toán
      </div>
      <div className="w-1/3 max-w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${seconds < totalSeconds * 0.2 ? 'bg-red-500' : 'bg-blue-500'}`} 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default Timer;