import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #000;
  color: white;
  font-family: 'Arial', sans-serif;
  padding: 1rem;
  touch-action: manipulation;
`;

const moveTopToRight = keyframes`
  0% { transform: translate(-146px, -146px); }
  100% { transform: translate(146px, -146px); }
`;

const moveRightToBottom = keyframes`
  0% { transform: translate(146px, -146px); }
  100% { transform: translate(146px, 146px); }
`;

const moveBottomToLeft = keyframes`
  0% { transform: translate(146px, 146px); }
  100% { transform: translate(-146px, 146px); }
`;

const moveLeftToTop = keyframes`
  0% { transform: translate(-146px, 146px); }
  100% { transform: translate(-146px, -146px); }
`;

const fadeIn = keyframes`
  0% { opacity: 0; }
  100% { opacity: 1; }
`;

const fadeOut = keyframes`
  0% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
`;

const PreparationText = styled.div`
  font-size: min(2rem, 5vw);
  font-weight: bold;
  color: white;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-in, ${fadeOut} 3s forwards 0.5s;
  max-width: 80%;
`;

const CountdownNumber = styled.div`
  font-size: min(6rem, 15vw);
  font-weight: bold;
  color: white;
  animation: ${fadeIn} 0.2s ease-in, ${fadeOut} 1s forwards 0.2s;
`;

const BreathBox = styled.div<{ isAnimating: boolean }>`
  width: min(300px, 80vw);
  height: min(300px, 80vw);
  border: 4px solid #ff69b4;
  border-radius: 20px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4rem;
  box-shadow: 0 0 20px rgba(255, 105, 180, 0.3);

  @media (max-width: 480px) {
    margin: 3rem;
  }
`;

const SideText = styled.div<{ position: 'top' | 'right' | 'bottom' | 'left'; active: boolean }>`
  position: absolute;
  color: ${props => props.active ? '#ff1493' : 'white'};
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  text-align: center;
  width: min-content;
  
  ${props => {
    switch (props.position) {
      case 'top':
        return `
          top: -3rem;
          left: 50%;
          transform: translateX(-50%);

          @media (max-width: 480px) {
            top: -2.5rem;
            font-size: 1rem;
          }
        `;
      case 'right':
        return `
          right: 0;
          top: 50%;
          transform-origin: center;
          transform: translate(calc(100% + 1rem), -50%) rotate(90deg);

          @media (max-width: 480px) {
            transform: translate(calc(100% + 0.8rem), -50%) rotate(90deg);
            font-size: 1rem;
          }
        `;
      case 'bottom':
        return `
          bottom: -3rem;
          left: 50%;
          transform: translateX(-50%);

          @media (max-width: 480px) {
            bottom: -2.5rem;
            font-size: 1rem;
          }
        `;
      case 'left':
        return `
          left: 0;
          top: 50%;
          transform-origin: center;
          transform: translate(calc(-100% - 1rem), -50%) rotate(-90deg);

          @media (max-width: 480px) {
            transform: translate(calc(-100% - 0.8rem), -50%) rotate(-90deg);
            font-size: 1rem;
          }
        `;
    }
  }}
`;

const Dot = styled.div<{ phase: number }>`
  width: min(20px, 5vw);
  height: min(20px, 5vw);
  background: #ff69b4;
  border-radius: 50%;
  position: absolute;
  animation: ${props => {
    switch (props.phase) {
      case 0: return moveTopToRight;
      case 1: return moveRightToBottom;
      case 2: return moveBottomToLeft;
      case 3: return moveLeftToTop;
      default: return 'none';
    }
  }} 4s linear;
  animation-fill-mode: forwards;
  box-shadow: 0 0 10px #ff69b4;
`;

const Timer = styled.div`
  font-size: ${props => {
    if (typeof props.children === 'object') {
      return 'min(2.5rem, 6vw)';
    }
    return 'min(6rem, 15vw)';
  }};
  font-weight: bold;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  line-height: 1.2;
  animation: ${fadeIn} 0.3s ease-in;
`;

const Button = styled.button`
  padding: 1rem 2rem;
  font-size: 1.2rem;
  background: linear-gradient(45deg, #ff69b4, #ff1493);
  border: none;
  border-radius: 25px;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
  margin: 1rem;

  &:hover {
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 480px) {
    padding: 0.8rem 1.6rem;
    font-size: 1rem;
  }
`;

const phases = ['Inhale', 'Hold', 'Exhale', 'Hold'];
const PHASE_DURATION = 4;

const Footer = styled.footer`
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: white;
  font-size: 0.8rem;

  @media (max-width: 480px) {
    font-size: 0.7rem;
    bottom: 0.5rem;
    right: 0.5rem;
  }
`;

const GitHubLink = styled.a`
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 16px;
    height: 16px;

    @media (max-width: 480px) {
      width: 14px;
      height: 14px;
    }
  }
`;

const AudioControls = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem;
  border-radius: 20px;
  backdrop-filter: blur(5px);

  @media (max-width: 480px) {
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.3rem;
    gap: 0.3rem;
  }
`;

const AudioControl = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  padding: 0.3rem;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 24px;
    height: 24px;

    @media (max-width: 480px) {
      width: 20px;
      height: 20px;
    }
  }
`;

const VolumeSlider = styled.input`
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  outline: none;

  @media (max-width: 480px) {
    display: none;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.2);
    }
  }

  &::-moz-range-thumb {
    width: 12px;
    height: 12px;
    background: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.2);
    }
  }
`;

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timer, setTimer] = useState(PHASE_DURATION);
  const [key, setKey] = useState(0);
  const [preparationStage, setPreparationStage] = useState<'initial' | 'preparing' | 'countdown' | 'running'>('initial');
  const [preparationKey, setPreparationKey] = useState(0);
  const [countdownNumber, setCountdownNumber] = useState(3);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleContainerClick = () => {
    if (!hasUserInteracted && audioRef.current) {
      setHasUserInteracted(true);
      audioRef.current.load();
      audioRef.current.play().catch(error => {
        console.log("Initial audio play failed:", error);
      });
    }
  };

  useEffect(() => {
    if (preparationStage === 'countdown' && hasUserInteracted) {
      if (audioRef.current) {
        audioRef.current.volume = 0;
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            if (audioRef.current) {
              audioRef.current.volume = 0;
              const fadeInInterval = setInterval(() => {
                if (audioRef.current && audioRef.current.volume < volume) {
                  audioRef.current.volume = Math.min(audioRef.current.volume + 0.1, volume);
                } else {
                  clearInterval(fadeInInterval);
                }
              }, 100);
            }
          }).catch(error => {
            console.log("Audio play failed:", error);
          });
        }
      }
    } else if (preparationStage === 'initial') {
      if (audioRef.current) {
        const fadeOutInterval = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0) {
            audioRef.current.volume = Math.max(audioRef.current.volume - 0.1, 0);
          } else {
            clearInterval(fadeOutInterval);
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }
        }, 100);
      }
    }
  }, [preparationStage, hasUserInteracted]);

  useEffect(() => {
    if (audioRef.current && preparationStage === 'running') {
      audioRef.current.volume = volume;
    }
  }, [volume, preparationStage]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (preparationStage === 'preparing') {
      setTimeout(() => {
        setPreparationStage('countdown');
      }, 3000);
    } else if (preparationStage === 'countdown') {
      interval = setInterval(() => {
        setCountdownNumber(prev => {
          if (prev === 1) {
            setPreparationStage('running');
            setIsRunning(true);
            return 3;
          }
          return prev - 1;
        });
        setPreparationKey(k => k + 1);
      }, 1000);
    } else if (preparationStage === 'running') {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            setCurrentPhase((prev) => (prev + 1) % phases.length);
            setKey(k => k + 1);
            return PHASE_DURATION;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [preparationStage]);

  const toggleBreathing = () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
    if (preparationStage === 'initial') {
      setPreparationStage('preparing');
      setTimer(PHASE_DURATION);
      setCurrentPhase(0);
      setKey(0);
    } else {
      setPreparationStage('initial');
      setIsRunning(false);
      setCountdownNumber(3);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const renderTimer = () => {
    if (preparationStage === 'initial') {
      return (
        <>
          <div>Press</div>
          <div>Start</div>
        </>
      );
    }
    if (preparationStage === 'preparing') {
      return <PreparationText key={preparationKey}>Be prepared to take a breath through...</PreparationText>;
    }
    if (preparationStage === 'countdown') {
      return <CountdownNumber key={preparationKey}>{countdownNumber}</CountdownNumber>;
    }
    return timer;
  };

  return (
    <AppContainer onClick={handleContainerClick}>
      <audio
        ref={audioRef}
        loop
        src="/music.mp3"
        preload="auto"
        playsInline
      />
      <AudioControls>
        <AudioControl onClick={toggleMute} type="button">
          {isMuted ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          )}
        </AudioControl>
        <VolumeSlider
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
      </AudioControls>
      <BreathBox isAnimating={isRunning}>
        <SideText position="top" active={isRunning && currentPhase === 0}>Inhale</SideText>
        <SideText position="right" active={isRunning && currentPhase === 1}>Hold</SideText>
        <SideText position="bottom" active={isRunning && currentPhase === 2}>Exhale</SideText>
        <SideText position="left" active={isRunning && currentPhase === 3}>Hold</SideText>
        {isRunning && <Dot key={key} phase={currentPhase} />}
        <Timer>{renderTimer()}</Timer>
      </BreathBox>
      <Button onClick={toggleBreathing}>
        {preparationStage !== 'initial' ? 'Stop' : 'Start'}
      </Button>
      <Footer>
        <div>Made by dEagle</div>
        <GitHubLink 
          href="https://github.com/dEagleProg/BoxBreath"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </GitHubLink>
      </Footer>
    </AppContainer>
  );
}

export default App; 