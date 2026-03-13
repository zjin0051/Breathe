import { useState } from 'react';
import { Volume2, Settings } from 'lucide-react';
import { useSpeech, SpeechOptions } from '../hooks/useSpeech';

interface GlobalSpeechControlsProps {
  className?: string;
}

export function GlobalSpeechControls({ className = '' }: GlobalSpeechControlsProps) {
  const { isSupported } = useSpeech();
  const [showSettings, setShowSettings] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-4 border-2 border-indigo-300 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Volume2 className="w-8 h-8 text-indigo-600" />
          <div>
            <h3 className="text-xl font-bold text-gray-900">Audio Reader</h3>
            <p className="text-lg text-gray-600">Click 🔊 buttons to hear information</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 rounded-xl bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition-colors"
          aria-label="Speech settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {showSettings && (
        <div className="mt-4 pt-4 border-t-2 border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-2">
                Reading Speed: {speechRate.toFixed(1)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-indigo-200"
                style={{
                  background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((speechRate - 0.5) / 1.0) * 100}%, #e0e7ff ${((speechRate - 0.5) / 1.0) * 100}%, #e0e7ff 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Slower</span>
                <span>Normal</span>
                <span>Faster</span>
              </div>
            </div>
            <p className="text-lg text-gray-700 bg-blue-50 p-3 rounded-lg">
              💡 Tip: Use the 🔊 Read buttons throughout the dashboard to hear information read aloud.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export { type SpeechOptions };
