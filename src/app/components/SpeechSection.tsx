import { ReactNode } from 'react';
import { SpeechButton } from './SpeechButton';
import { SpeechOptions } from '../hooks/useSpeech';

interface SpeechSectionProps {
  children: ReactNode;
  text: string; // The text to be read aloud
  label?: string;
  options?: SpeechOptions;
  showButton?: boolean;
  buttonPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'small' | 'medium' | 'large';
}

export function SpeechSection({ 
  children, 
  text,
  label = "🔊 Read This",
  options = {},
  showButton = true,
  buttonPosition = 'top-right',
  variant = 'secondary',
  size = 'medium'
}: SpeechSectionProps) {
  const positionClasses = {
    'top-right': 'absolute top-4 right-4',
    'top-left': 'absolute top-4 left-4',
    'bottom-right': 'absolute bottom-4 right-4',
    'bottom-left': 'absolute bottom-4 left-4',
    'inline': 'mb-4'
  };

  return (
    <div className={buttonPosition !== 'inline' ? 'relative' : ''}>
      {showButton && (
        <div className={positionClasses[buttonPosition]}>
          <SpeechButton 
            text={text}
            label={label}
            options={options}
            variant={variant}
            size={size}
          />
        </div>
      )}
      {children}
    </div>
  );
}
