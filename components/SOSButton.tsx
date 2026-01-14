
import React, { useState, useEffect } from 'react';

interface SOSButtonProps {
  onTrigger: () => void;
  onCancel: () => void;
  isTriggered: boolean;
}

const SOSButton: React.FC<SOSButtonProps> = ({ onTrigger, onCancel, isTriggered }) => {
  const [countdown, setCountdown] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isCountingDown && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    } else if (countdown === 0) {
      setIsCountingDown(false);
      onTrigger();
    }
    return () => clearInterval(timer);
  }, [isCountingDown, countdown, onTrigger]);

  const handlePress = () => {
    if (isTriggered) {
      onCancel();
      setCountdown(5);
      setIsCountingDown(false);
    } else {
      setIsCountingDown(true);
      setCountdown(5);
    }
  };

  const handleCancelCountdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCountingDown(false);
    setCountdown(5);
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center">
      {isCountingDown && (
        <div className="mb-4 bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-xl animate-bounce">
          SOS Sending in {countdown}s...
          <button 
            onClick={handleCancelCountdown}
            className="ml-3 underline text-xs uppercase tracking-widest"
          >
            Cancel
          </button>
        </div>
      )}
      
      <button
        onClick={handlePress}
        className={`w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all active:scale-95 shadow-2xl ${
          isTriggered || isCountingDown
            ? 'bg-red-600 text-white sos-glow'
            : 'bg-white text-red-600 border-4 border-red-500'
        }`}
      >
        <svg className="w-10 h-10 mb-1" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <span className="font-black text-xl leading-none">{isTriggered ? 'STOP' : 'SOS'}</span>
      </button>
      
      {!isTriggered && !isCountingDown && (
        <p className="mt-2 text-slate-500 text-xs font-semibold uppercase tracking-widest">
          Hold 5s to Activate
        </p>
      )}
    </div>
  );
};

export default SOSButton;
