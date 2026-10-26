import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './auto-effects.css';

const pages = [
  { id: 'cover', label: 'Invitation' },
  { id: 'couple', label: 'Taha & Munira' },
  { id: 'story', label: 'Our Story' },
  { id: 'events', label: 'Events' },
  { id: 'venue', label: 'Venue' },
  { id: 'gallery', label: 'Gallery' },
];

const RELEASE_MS = 420;
const DRAG_THRESHOLD = 0.28;
const AUTO_TURN_MS = 5000;
const PETAL_COUNT = 12;

function RosePetal({ index }) {
  return (
    <span className={`rose-petal rose-petal-${index + 1}`} aria-hidden="true">
      <svg viewBox="0 0 44 62" focusable="false">
        <defs>
          <linearGradient id={`petal-fill-${index}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e83a4d" />
            <stop offset="0.48" stopColor="#a90f2c" />
            <stop offset="1" stopColor="#4d0718" />
          </linearGradient>
          <radialGradient id={`petal-light-${index}`} cx="32%" cy="24%" r="72%">
            <stop offset="0" stopColor="#ff9b9e" stopOpacity=".72" />
            <stop offset=".42" stopColor="#e94b5b" stopOpacity=".22" />
            <stop offset="1" stopColor="#5d071b" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M22 2C35 8 43 19 39 33c-3 12-12 21-20 27C10 53 3 43 4 31 5 17 11 8 22 2Z" fill={`url(#petal-fill-${index})`} />
        <path d="M22 2C35 8 43 19 39 33c-3 12-12 21-20 27C10 53 3 43 4 31 5 17 11 8 22 2Z" fill={`url(#petal-light-${index})`} />
        <path d="M22 7C20 24 18 39 15 52" fill="none" stroke="#ffb0ad" strokeOpacity=".25" strokeWidth="1.2" />
      </svg>
    </span>
  );
}

function App() {
  const [page, setPage] = useState(0);
  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [turningIndex, setTurningIndex] = useState(null);
  const [turnDirection, setTurnDirection] = useState(null);
  const [turnProgress, setTurnProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [transitionFx, setTransitionFx] = useState(null);
  const gesture = useRef(null);
  const turnProgressRef = useRef(0);
  const autoTimer = useRef(null);
  const fxTimer = useRef(null);
  const audioRef = useRef(null);

  const setProgress = (value) => {
    const nextValue = Math.min(Math.max(value, 0), 0.98);
    turnProgressRef.current = nextValue;
    setTurnProgress(nextValue);
  };

  const triggerFx = (mode) => {
    setTransitionFx(null);
    window.requestAnimationFrame(() => setTransitionFx(mode));
    window.clearTimeout(fxTimer.current);
    fxTimer.current = window.setTimeout(() => setTransitionFx(null), mode === 'petals' ? 1500 : 900);
  };

  const finishTurn = (direction, committed) => {
    window.setTimeout(() => {
      if (committed) {
        const nextPage = direction === 'next' ? page + 1 : page - 1;
        setPage(nextPage);
        triggerFx('petals');
      }
      setTurningIndex(null);
      setTurnDirection(null);
      setProgress(0);
      setIsReleasing(false);
    }, RELEASE_MS);
  };

  const next = () => {
    if (turningIndex !== null || page >= pages.length - 1) return;
    setHasInteracted(true);
    setTurningIndex(page);
    setTurnDirection('next');
    setProgress(1);
    setIsReleasing(true);
    finishTurn('next', true);
  };

  const previous = () => {
    if (turningIndex !== null || page <= 0) return;
    setHasInteracted(true);
    setTurningIndex(page - 1);
    setTurnDirection('previous');
    setProgress(1);
    setIsReleasing(true);
    finishTurn('previous', true);
  };

  const openInvitation = async () => {
    setOpened(true);
    setMusicOn(true);
    triggerFx('sparkles');
    const audio = audioRef.current;
    if (!audio) return;
    try {
      audio.currentTime = 0;
      await audio.play();
    } catch {
      setMusicOn(false);
    }
  };

  const toggleMusic = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn) {
      audio.pause();
      setMusicOn(false);
      return;
    }
    try {
      await audio.play();
      setMusicOn(true);
    } catch {
      setMusicOn(false);
    }
  };

  useEffect(() => {
    if (!opened || turningIndex !== null || page >= pages.length - 1) return undefined;
    window.clearTimeout(autoTimer.current);
    autoTimer.current = window.setTimeout(() => next(), AUTO_TURN_MS);
    return () => window.clearTimeout(autoTimer.current);
  }, [opened, page, turningIndex, hasInteracted]);

  useEffect(() => () => {
    window.clearTimeout(autoTimer.current);
    window.clearTimeout(fxTimer.current);
    audioRef.current?.pause();
  }, []);

  const progress = useMemo(() => `${((page + 1) / pages.length) * 100}%`, [page]);

  const startGesture = (event) => {
    if (turningIndex !== null || !opened) return;
    setHasInteracted(true);
    gesture.current = { pointerId: event.pointerId, startX: event.clientX, direction: null };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const moveGesture = (event) => {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId || turningIndex !== null) return;
    const deltaX = event.clientX - active.startX;
    if (!active.direction && Math.abs(deltaX) > 8) {
      if (deltaX < 0 && page < pages.length - 1) active.direction = 'next';
      if (deltaX > 0 && page > 0) active.direction = 'previous';
      if (active.direction) {
        setTurningIndex(active.direction === 'next' ? page : page - 1);
        setTurnDirection(active.direction);
        setIsDragging(true);
        setIsReleasing(false);
        setProgress(0);
      }
    }
    if (!active.direction) return;
    const stageWidth = event.currentTarget.getBoundingClientRect().width;
    setProgress(Math.abs(deltaX) / Math.max(stageWidth, 1));
  };

  const endGesture = (event, cancelled = false) => {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const direction = active.direction;
    const currentProgress = turnProgressRef.current;
    gesture.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (!direction || cancelled) {
      setIsDragging(false);
      setTurningIndex(null);
      setTurnDirection(null);
      setProgress(0);
      return;
    }
    const committed = currentProgress >= DRAG_THRESHOLD;
    setIsDragging(false);
    setIsReleasing(true);
    setProgress(committed ? 1 : 0);
    finishTurn(direction, committed);
  };

  if (!opened) {
    return (
      <main className="opening-screen">
        <div className="opening-glow" />
        <section className="opening-card" aria-label="Wedding invitation opening">
          <p className="eyebrow">A celebration of love</p>
          <div className="seal">T<span>&amp;</span>M</div>
          <p className="script">Together with their families</p>
          <h1>Our Wedding</h1>
          <p className="opening-copy">An invitation to share a beautiful beginning.</p>
          <button className="primary-button" onClick={openInvitation}>Open Invitation</button>
          <p className="tap-hint">Tap to enter</p>
        </section>
      </main>
    );
  }

  return (
    <main className={`app-shell ${transitionFx ? `fx-${transitionFx}` : ''}`}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="transition-effects" aria-hidden="true">
        {transitionFx === 'petals' && Array.from({ length: PETAL_COUNT }, (_, index) => <RosePetal key={index} index={index} />)}
        {transitionFx === 'sparkles' && Array.from({ length: 7 }, (_, index) => <span key={index} className={`sparkle sparkle-${index + 1}`} />)}
      </div>
      <audio ref={audioRef} loop preload="none" aria-hidden="true"><source src="/music/wedding-music.mp3" type="audio/mpeg" /></audio>

      <header className="topbar">
        <div className="brand-mark">T <span>×</span> M</div>
        <div className="topbar-right">
          <button className="icon-button" onClick={toggleMusic} aria-label={musicOn ? 'Mute music' : 'Play music'}>{musicOn ? '♫' : '♪'}</button>
          <span>{page + 1} / {pages.length}</span>
        </div>
      </header>

      <section className="book-stage" onPointerDown={startGesture} onPointerMove={moveGesture} onPointerUp={endGesture} onPointerCancel={(event) => endGesture(event, true)} aria-label="Wedding invitation book">
        <div className="book-shadow" />
        <div className="book">
          <div className="paper-stack" />
          <div className="book-cover-back" />
          <div className="book-spine" />
          <div className="bookmark-ribbon" aria-hidden="true"><span className="ribbon-tail" /><span className="ribbon-tassel"><i /><b /><em /></span></div>
          {pages.map((item, index) => {
            const isTurning = index === turningIndex;
            const className = ['page-sheet', index < page ? 'is-turned' : '', index === page ? 'is-current' : '', isTurning ? `is-turning-${turnDirection}` : '', isTurning && isDragging ? 'is-dragging' : '', isTurning && isReleasing ? 'is-releasing' : ''].filter(Boolean).join(' ');
            return (
              <article key={item.id} className={className} style={{ zIndex: isTurning && turnDirection === 'previous' ? pages.length + 2 : pages.length - index, '--turn-progress': turnProgress }} aria-hidden={index !== page}>
                <div className="page-face page-front"><PageContent page={item.id} /></div>
                <div className="page-face page-back"><div className="page-back-inner"><span>T &amp; M</span><small>{index + 1}</small></div></div>
              </article>
            );
          })}
        </div>
      </section>

      <nav className="book-controls" aria-label="Invitation navigation">
        <button className="nav-button" onClick={previous} disabled={page === 0 || turningIndex !== null} aria-label="Previous page">←</button>
        <div className="progress-wrap"><div className="progress-track"><span style={{ width: progress }} /></div><div className="page-label">{pages[page].label}</div></div>
        <button className="nav-button" onClick={next} disabled={page === pages.length - 1 || turningIndex !== null} aria-label="Next page">→</button>
      </nav>
    </main>
  );
}

function PageContent({ page }) {
  switch (page) {
    case 'couple': return <div className="content-page couple-page"><p className="eyebrow">The beginning of forever</p><h2>Taha<br /><span>&amp;</span><br />Munira</h2><p className="body-copy">Two hearts, one beautiful journey. We invite you to celebrate the love, laughter and life we are building together.</p><div className="photo-placeholder portrait">T &amp; M</div><p className="date-line">20 · 12 · 2026</p></div>;
    case 'story': return <div className="content-page story-page"><p className="eyebrow">Taha &amp; Munira</p><h2>From a hello<br /><em>to forever.</em></h2><div className="story-line"><span>01</span><p>We met, we laughed, and somewhere between ordinary moments, something extraordinary began.</p></div><div className="story-line"><span>02</span><p>Every chapter brought us closer and made us certain that the best stories are the ones written together.</p></div><div className="story-line"><span>03</span><p>Now, surrounded by the people we love, we begin our favourite chapter yet.</p></div></div>;
    case 'events': return <div className="content-page"><p className="eyebrow">Taha &amp; Munira</p><h2>Wedding<br /><em>Celebrations</em></h2><div className="event-list"><Event date="18 DEC" title="Mehendi" time="6:00 PM" /><Event date="19 DEC" title="Wedding Ceremony" time="7:00 PM" /><Event date="20 DEC" title="Reception" time="8:00 PM" /></div></div>;
    case 'venue': return <div className="content-page venue-page"><p className="eyebrow">Taha &amp; Munira</p><h2>The<br /><em>Venue</em></h2><div className="venue-card"><div className="map-placeholder"><span>MAP</span></div><div><h3>The Grand Garden</h3><p>123 Celebration Avenue<br />Mumbai, India</p><button className="text-button">Get directions ↗</button></div></div></div>;
    case 'gallery': return <div className="content-page gallery-page"><p className="eyebrow">Taha &amp; Munira</p><h2>Our<br /><em>Moments</em></h2><div className="gallery-grid"><div className="photo-placeholder g-one">01</div><div className="photo-placeholder g-two">02</div><div className="photo-placeholder g-three">03</div><div className="photo-placeholder g-four">04</div></div><a className="whatsapp-button" href="https://wa.me/" target="_blank" rel="noreferrer">RSVP on WhatsApp ↗</a></div>;
    default: return <div className="content-page cover-page"><p className="eyebrow">You are invited</p><div className="cover-ornament">❦</div><h2>Taha<br /><span>&amp;</span><br />Munira</h2><p className="script">are getting married</p><div className="cover-date">20 December 2026</div><p className="cover-location">Mumbai · India</p></div>;
  }
}

function Event({ date, title, time }) { return <article className="event"><div className="event-date">{date}</div><div><h3>{title}</h3><p>{time}</p></div></article>; }

createRoot(document.getElementById('root')).render(<App />);
