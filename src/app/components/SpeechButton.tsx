import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { useSpeech, SpeechOptions } from "../hooks/useSpeech";

interface SpeechButtonProps {
  text: string;
  label?: string;
  options?: SpeechOptions;
  variant?: "primary" | "secondary" | "minimal";
  size?: "small" | "medium" | "large";
  className?: string;
}

export function SpeechButton({
  text,
  label = "Read Aloud",
  options = {},
  variant = "primary",
  size = "medium",
  className = "",
}: SpeechButtonProps) {
  const {
    speak,
    pause,
    resume,
    stop,
    isSpeaking,
    isPaused,
    isSupported,
  } = useSpeech();

  if (!isSupported) {
    return null; // Don't show button if speech is not supported
  }

  const handleClick = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(text, options);
    }
  };

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    stop();
  };

  // Size classes
  const sizeClasses = {
    small: "text-lg px-4 py-2",
    medium: "text-xl px-6 py-3",
    large: "text-2xl px-8 py-4",
  };

  const iconSizes = {
    small: "w-5 h-5",
    medium: "w-6 h-6",
    large: "w-8 h-8",
  };

  // Variant classes
  const variantClasses = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-indigo-700 shadow-lg",
    secondary:
      "bg-white hover:bg-gray-50 text-indigo-600 border-2 border-indigo-400 shadow-md",
    minimal:
      "bg-transparent hover:bg-indigo-50 text-indigo-600 border-2 border-transparent",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <button
        onClick={handleClick}
        className={`
          inline-flex items-center gap-3 rounded-xl
          transition-all duration-200 font-semibold
          focus:outline-none focus:ring-4 focus:ring-indigo-400
          ${sizeClasses[size]}
          ${variantClasses[variant]}
        `}
        aria-label={
          isSpeaking
            ? isPaused
              ? "Resume reading"
              : "Pause reading"
            : label
        }
      >
        {isSpeaking ? (
          isPaused ? (
            <Play className={iconSizes[size]} />
          ) : (
            <Pause className={iconSizes[size]} />
          )
        ) : (
          <Volume2 className={iconSizes[size]} />
        )}
        <span>
          {isSpeaking ? (isPaused ? "Resume" : "Pause") : label}
        </span>
      </button>

      {isSpeaking && (
        <button
          onClick={handleStop}
          className={`
            inline-flex items-center gap-2 rounded-xl
            transition-all duration-200 font-semibold
            focus:outline-none focus:ring-4 focus:ring-red-400
            bg-red-600 hover:bg-red-700 text-white border-2 border-red-700 shadow-lg
            ${sizeClasses[size]}
          `}
          aria-label="Stop reading"
        >
          <VolumeX className={iconSizes[size]} />
          <span>Stop</span>
        </button>
      )}
    </div>
  );
}