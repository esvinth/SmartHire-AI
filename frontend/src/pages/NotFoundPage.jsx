import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const PANDA_STATES = {
  EATING: 'eating',
  SLEEPING: 'sleeping',
  WAVING: 'waving',
};

function Panda({ state, onClick }) {
  const [chewFrame, setChewFrame] = useState(0);
  const [zzz, setZzz] = useState(0);

  useEffect(() => {
    if (state === PANDA_STATES.EATING) {
      const interval = setInterval(() => setChewFrame((f) => (f + 1) % 3), 400);
      return () => clearInterval(interval);
    }
    if (state === PANDA_STATES.SLEEPING) {
      const interval = setInterval(() => setZzz((z) => (z + 1) % 4), 800);
      return () => clearInterval(interval);
    }
  }, [state]);

  const eyeL = state === PANDA_STATES.SLEEPING ? '−' : state === PANDA_STATES.WAVING ? '◕' : '◕';
  const eyeR = state === PANDA_STATES.SLEEPING ? '−' : state === PANDA_STATES.WAVING ? '◕' : '◕';

  const mouths = {
    [PANDA_STATES.EATING]: ['ᗢ', 'ᗤ', 'ᗢ'],
    [PANDA_STATES.SLEEPING]: ['〜'],
    [PANDA_STATES.WAVING]: ['▽'],
  };
  const mouth = state === PANDA_STATES.EATING ? mouths[state][chewFrame] : mouths[state][0];

  const zzzText = state === PANDA_STATES.SLEEPING
    ? 'z'.repeat(zzz + 1)
    : '';

  return (
    <div
      className="relative cursor-pointer select-none"
      onClick={onClick}
      title="Click me!"
    >
      {/* Zzz floating */}
      {state === PANDA_STATES.SLEEPING && (
        <div className="absolute -top-8 -right-4 text-primary-400 font-bold text-xl animate-bounce">
          {zzzText}
        </div>
      )}

      {/* Waving hand */}
      {state === PANDA_STATES.WAVING && (
        <div className="absolute -top-6 -right-6 text-4xl animate-wiggle">
          👋
        </div>
      )}

      {/* Carrot when eating */}
      {state === PANDA_STATES.EATING && (
        <div
          className="absolute -right-10 top-12 text-3xl transition-transform"
          style={{
            transform: chewFrame === 1 ? 'rotate(-20deg) translateX(-4px)' : 'rotate(-10deg)',
          }}
        >
          🥕
        </div>
      )}

      {/* Panda SVG */}
      <svg viewBox="0 0 200 200" width="180" height="180" className="drop-shadow-lg">
        {/* Body */}
        <ellipse cx="100" cy="150" rx="55" ry="40" fill="white" stroke="#1a1a1a" strokeWidth="3" />

        {/* Head */}
        <circle cx="100" cy="85" r="50" fill="white" stroke="#1a1a1a" strokeWidth="3" />

        {/* Ears */}
        <circle cx="60" cy="45" r="18" fill="#1a1a1a" />
        <circle cx="140" cy="45" r="18" fill="#1a1a1a" />
        <circle cx="60" cy="45" r="9" fill="#4a4a4a" />
        <circle cx="140" cy="45" r="9" fill="#4a4a4a" />

        {/* Eye patches */}
        <ellipse cx="78" cy="80" rx="18" ry="16" fill="#1a1a1a" transform="rotate(-10 78 80)" />
        <ellipse cx="122" cy="80" rx="18" ry="16" fill="#1a1a1a" transform="rotate(10 122 80)" />

        {/* Eyes */}
        <text x="73" y="86" fontSize="16" fill="white" textAnchor="middle" dominantBaseline="middle">
          {eyeL}
        </text>
        <text x="127" y="86" fontSize="16" fill="white" textAnchor="middle" dominantBaseline="middle">
          {eyeR}
        </text>

        {/* Eye shine */}
        {state !== PANDA_STATES.SLEEPING && (
          <>
            <circle cx="76" cy="79" r="2.5" fill="white" opacity="0.8" />
            <circle cx="130" cy="79" r="2.5" fill="white" opacity="0.8" />
          </>
        )}

        {/* Nose */}
        <ellipse cx="100" cy="95" rx="6" ry="4" fill="#1a1a1a" />

        {/* Mouth */}
        <text x="100" y="110" fontSize="14" textAnchor="middle" dominantBaseline="middle">
          {mouth}
        </text>

        {/* Blush */}
        <circle cx="68" cy="98" r="8" fill="#ffb3b3" opacity="0.5" />
        <circle cx="132" cy="98" r="8" fill="#ffb3b3" opacity="0.5" />

        {/* Arms */}
        <ellipse
          cx="55" cy="140" rx="12" ry="25" fill="#1a1a1a"
          transform={state === PANDA_STATES.WAVING ? 'rotate(30 55 140)' : 'rotate(15 55 140)'}
          className="transition-transform duration-300"
        />
        <ellipse cx="145" cy="140" rx="12" ry="25" fill="#1a1a1a" transform="rotate(-15 145 140)" />

        {/* Feet */}
        <ellipse cx="80" cy="185" rx="16" ry="10" fill="#1a1a1a" />
        <ellipse cx="120" cy="185" rx="16" ry="10" fill="#1a1a1a" />

        {/* Belly patch */}
        <ellipse cx="100" cy="150" rx="28" ry="22" fill="#f5f5f5" opacity="0.6" />
      </svg>
    </div>
  );
}

function FallingCarrot({ style }) {
  return (
    <div
      className="absolute text-2xl pointer-events-none animate-fall"
      style={style}
    >
      🥕
    </div>
  );
}

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [pandaState, setPandaState] = useState(PANDA_STATES.EATING);
  const [carrots, setCarrots] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const containerRef = useRef(null);

  // Cycle panda states automatically
  useEffect(() => {
    const cycle = [PANDA_STATES.EATING, PANDA_STATES.SLEEPING, PANDA_STATES.EATING, PANDA_STATES.WAVING];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % cycle.length;
      setPandaState(cycle[i]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Spawn falling carrots
  useEffect(() => {
    const interval = setInterval(() => {
      setCarrots((prev) => {
        const filtered = prev.filter((c) => Date.now() - c.id < 4000);
        return [
          ...filtered,
          {
            id: Date.now(),
            left: Math.random() * 90 + 5,
            delay: Math.random() * 0.5,
            duration: 3 + Math.random() * 2,
            rotation: Math.random() * 360,
          },
        ];
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handlePandaClick = () => {
    const next = clickCount % 3;
    const states = [PANDA_STATES.WAVING, PANDA_STATES.EATING, PANDA_STATES.SLEEPING];
    setPandaState(states[next]);
    setClickCount((c) => c + 1);
  };

  const messages = {
    [PANDA_STATES.EATING]: "Nom nom... this page doesn't exist, but these carrots are great!",
    [PANDA_STATES.SLEEPING]: "Zzz... even this panda fell asleep looking for that page...",
    [PANDA_STATES.WAVING]: "Hey there! Looks like you're lost. Let me help!",
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-green-50 via-emerald-50 to-green-100 flex flex-col items-center justify-center relative overflow-hidden px-4"
    >
      {/* Falling carrots */}
      {carrots.map((c) => (
        <FallingCarrot
          key={c.id}
          style={{
            left: `${c.left}%`,
            top: '-40px',
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.duration}s`,
            transform: `rotate(${c.rotation}deg)`,
          }}
        />
      ))}

      {/* Bamboo decoration left */}
      <div className="absolute left-4 bottom-0 opacity-20 text-green-600 text-8xl sm:text-9xl leading-none select-none">
        🎋
      </div>
      {/* Bamboo decoration right */}
      <div className="absolute right-4 bottom-0 opacity-20 text-green-600 text-8xl sm:text-9xl leading-none select-none">
        🎋
      </div>

      {/* 404 text */}
      <h1 className="text-8xl sm:text-9xl font-black text-gray-800 mb-2 tracking-tight relative">
        4
        <span className="inline-block animate-spin-slow">🐼</span>
        4
      </h1>

      {/* Panda character */}
      <div className="my-6">
        <Panda state={pandaState} onClick={handlePandaClick} />
      </div>

      {/* Message */}
      <p className="text-lg sm:text-xl text-gray-600 text-center max-w-md mb-2 transition-all duration-500">
        {messages[pandaState]}
      </p>

      <p className="text-sm text-gray-400 mb-8">
        Click the panda to interact!
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-lg hover:bg-primary-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Take Me Home
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-lg border border-gray-200 hover:bg-gray-50 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Go Back
        </button>
      </div>

      {/* Footer fun text */}
      <p className="mt-12 text-xs text-gray-400 text-center">
        Error 404 — Page not found. The panda ate it. Sorry.
      </p>

      {/* Inline keyframes & animations */}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-20deg); }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-wiggle {
          animation: wiggle 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
