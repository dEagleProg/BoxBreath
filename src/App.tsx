import React, { useState, useEffect } from 'react';
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
  font-size: min(1.5rem, 4vw);
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
      return 'min(1.5rem, 4vw)';
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
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 0.9rem;
`;

const GitHubLink = styled.a`
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 1;
  }

  svg {
    width: 20px;
    height: 20px;
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

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (preparationStage === 'preparing') {
      // Show preparation text for 3 seconds
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
    <AppContainer>
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