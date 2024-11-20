
import { FC } from 'react';

const LoadingAnimation: FC<{className?: string}> = ({className})  => {
  return (
    <div className={`flex ${className}`}>
      <div 
        className="grid grid-cols-2 gap-1 relative"
        role="status"
        aria-label="Loading"
      >
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`w-2 h-2 bg-white absolute animate-terminal-loading-${index + 1}`}
            style={{
              top: index < 2 ? 0 : '10px',
              left: index % 2 === 0 ? 0 : '10px',
            }}
          />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default LoadingAnimation;