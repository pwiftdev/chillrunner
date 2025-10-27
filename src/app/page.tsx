'use client';

import { useState, useEffect, useRef } from 'react';
import { FaTwitter, FaPlay, FaPause } from 'react-icons/fa';

export default function Home() {
  const [showMainPage, setShowMainPage] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const messages = [
    "I will just... never stop running",
    "Running is my meditation", 
    "One step at a time",
    "The road never ends",
    "Forever in motion",
    "Chill vibes only"
  ];

  const [currentMessage, setCurrentMessage] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [randomPosition, setRandomPosition] = useState({ top: '25%', left: '25%', rotation: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<number[]>(new Array(16).fill(0));
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number, life: number}>>([]);

  const generateRandomPosition = () => {
    const top = Math.random() * 60 + 20; // 20% to 80%
    const left = Math.random() * 60 + 20; // 20% to 80%
    const rotation = (Math.random() - 0.5) * 30; // -15 to +15 degrees
    return { top: `${top}%`, left: `${left}%`, rotation };
  };


  const handleEnter = () => {
    setShowMainPage(true);
    // Start playing music when entering main page
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
      setupAudioVisualization();
    }
  };

  const setupAudioVisualization = () => {
    if (!audioRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(audioRef.current);
      
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      analyser.fftSize = 64;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVisualization = () => {
        if (!isPlaying) {
          // Reset to random values when not playing
          setAudioData(Array.from({ length: 16 }, () => Math.random() * 0.3));
          return;
        }
        
        analyser.getByteFrequencyData(dataArray);
        
        // Convert to 16 bars
        const newAudioData = [];
        for (let i = 0; i < 16; i++) {
          const start = Math.floor((i / 16) * bufferLength);
          const end = Math.floor(((i + 1) / 16) * bufferLength);
          let sum = 0;
          for (let j = start; j < end; j++) {
            sum += dataArray[j];
          }
          newAudioData.push(sum / (end - start) / 255);
        }
        
        setAudioData(newAudioData);
        requestAnimationFrame(updateVisualization);
      };

      updateVisualization();
    } catch (error) {
      console.log('Audio visualization not supported, using random data');
      // Fallback to random data
      const randomData = Array.from({ length: 16 }, () => Math.random() * 0.5 + 0.2);
      setAudioData(randomData);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
        setupAudioVisualization();
      }
    }
  };

  // Particle system
  const createParticle = () => {
    return {
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      life: 1
    };
  };

  const updateParticles = () => {
    setParticles(prev => {
      return prev
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          life: particle.life - 0.01
        }))
        .filter(particle => particle.life > 0)
        .concat(Array.from({ length: 2 }, createParticle));
    });
  };

  const handleCopyCA = () => {
    // TODO: Replace with actual contract address
    const contractAddress = "0x0000000000000000000000000000000000000000";
    navigator.clipboard.writeText(contractAddress).then(() => {
      alert("Contract Address copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy contract address");
    });
  };

  useEffect(() => {
    if (!showMainPage) return;

    const interval = setInterval(() => {
      setShowMessage(false);
      setTimeout(() => {
        setCurrentMessage((prev) => (prev + 1) % messages.length);
        setRandomPosition(generateRandomPosition());
        setShowMessage(true);
      }, 500);
    }, 3000);

    // Show first message immediately with random position
    setRandomPosition(generateRandomPosition());
    setShowMessage(true);

    return () => clearInterval(interval);
  }, [messages.length, showMainPage]);


  // Particle animation
  useEffect(() => {
    if (!showMainPage) return;

    const particleInterval = setInterval(updateParticles, 50);
    return () => clearInterval(particleInterval);
  }, [showMainPage]);

  // Fallback audio visualization when not playing
  useEffect(() => {
    if (!isPlaying && showMainPage) {
      const fallbackInterval = setInterval(() => {
        setAudioData(Array.from({ length: 16 }, () => Math.random() * 0.3 + 0.1));
      }, 200);
      return () => clearInterval(fallbackInterval);
    }
  }, [isPlaying, showMainPage]);

  // Loader Page
  if (!showMainPage) {
    return (
      <div className="min-h-screen w-screen bg-[#898d6c] flex flex-col items-center justify-center relative">
        {/* Background Music */}
        <audio ref={audioRef} loop>
          <source src="/chillmusic.mp3" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        {/* Loader Content */}
        <div className="text-center text-white px-4">
          {/* Logo */}
          <div className="mb-6 md:mb-8">
            <img 
              src="/runnerlogo.jpeg" 
              alt="$RUNNER Logo" 
              className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto object-cover border-4 border-white/30 shadow-2xl"
            />
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold mb-6 md:mb-8 animate-pulse">$RUNNER</h1>
          <p className="text-xl md:text-3xl font-light mb-8 md:mb-12">Just a chill runner</p>
          
          <button
            onClick={handleEnter}
            className="bg-white/20 backdrop-blur-sm px-6 py-3 md:px-8 md:py-4 rounded-full border border-white/50 text-white text-lg md:text-xl font-medium hover:bg-white/30 transition-all duration-300 hover:scale-105"
          >
            ENTER
          </button>
        </div>
      </div>
    );
  }

  // Main Page
  return (
    <div className="min-h-screen w-screen bg-[#898d6c] flex flex-col items-center justify-center relative">
      {/* Background Music */}
      <audio ref={audioRef} loop autoPlay>
        <source src="/chillmusic.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Particle Effects */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-white/30 rounded-full pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            opacity: particle.life,
            transform: `scale(${particle.life})`
          }}
        />
      ))}

      {/* Video Container */}
      <div className="relative w-full md:w-[70%] max-w-4xl">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full rounded-lg"
        >
          <source src="/runnervideo2.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Moving Message Over Video */}
        {showMessage && (
          <div 
            className="absolute text-white text-sm font-medium transition-all duration-700 ease-in-out transform"
            style={{
              top: randomPosition.top,
              left: randomPosition.left,
              transform: `translate(-50%, -50%) rotate(${randomPosition.rotation}deg)`
            }}
          >
            <div className="bg-black/50 backdrop-blur-sm px-3 py-2 md:px-4 rounded-full border border-white/50 whitespace-nowrap text-xs md:text-sm">
              &ldquo;{messages[currentMessage]}&rdquo;
            </div>
          </div>
        )}
      </div>
      
      {/* Liquid Glass Header */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[85%] md:w-[95%] max-w-7xl z-50">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-6 md:p-6 p-4 shadow-2xl">
          <div className="flex items-center justify-between">
            {/* Left Side - Logo and Text */}
            <div className="flex items-center gap-4 md:gap-6">
              <img 
                src="/runnerlogo.jpeg" 
                alt="$RUNNER Logo" 
                className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover border-2 border-white/30"
              />
              <div>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-1">$RUNNER</h1>
                <p className="text-base md:text-xl text-white/80 font-light">Just a chill runner</p>
              </div>
            </div>
            
            {/* Right Side - Music Controls and Chart Button */}
            <div className="flex items-center gap-4">
              {/* Equalizer - Hidden on mobile */}
              <div className="hidden md:flex items-end gap-1 h-8">
                {audioData.slice(0, 8).map((value, i) => (
                  <div
                    key={i}
                    className="bg-white/60 w-1 rounded-full transition-all duration-100"
                    style={{
                      height: `${Math.max(value * 100, 5)}%`,
                    }}
                  />
                ))}
              </div>
              
              {/* Play/Pause Button - Hidden on mobile */}
              <button
                onClick={toggleMusic}
                className="hidden md:block bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105"
              >
                {isPlaying ? <FaPause className="text-lg" /> : <FaPlay className="text-lg" />}
              </button>
              
              {/* Chart Button */}
              <button className="bg-white/20 backdrop-blur-sm px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/30 text-white text-sm md:text-lg font-medium hover:bg-white/30 transition-all duration-300 hover:scale-105">
                Chart
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Equalizer - Fixed above X button */}
      <div className="fixed bottom-24 left-4 text-white md:hidden z-40">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-2xl">
          <div className="flex items-end gap-1 h-4">
            {audioData.slice(0, 4).map((value, i) => (
              <div
                key={i}
                className="bg-white/60 w-0.5 rounded-full transition-all duration-100"
                style={{
                  height: `${Math.max(value * 100, 5)}%`,
                }}
              />
            ))}
          </div>
          <span className="text-sm font-medium">Music</span>
          <button
            onClick={toggleMusic}
            className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full border border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105"
          >
            {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs" />}
          </button>
        </div>
      </div>

      {/* Bottom Left - X Link */}
      <div className="fixed bottom-6 left-4 md:bottom-8 md:left-8 text-white z-40">
        <a 
          href="https://x.com/i/communities/1982937891119509718/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 md:px-6 md:py-3 flex items-center gap-2 md:gap-3 hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-2xl"
        >
          <FaTwitter className="text-lg md:text-xl" />
          <span className="text-sm md:text-lg font-medium">Join us on X</span>
        </a>
      </div>
      
      {/* Bottom Right - CA Button */}
      <div className="fixed bottom-6 right-4 md:bottom-8 md:right-8 text-white z-40">
        <button
          onClick={handleCopyCA}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 md:px-6 md:py-3 text-white text-sm md:text-lg font-medium hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-2xl"
        >
          Copy CA
        </button>
      </div>
    </div>
  );
}
