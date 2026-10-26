import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const pages = [
  { id: 'cover', label: 'Invitation' },
  { id: 'couple', label: 'The Couple' },
  { id: 'story', label: 'Our Story' },
  { id: 'events', label: 'Events' },
  { id: 'venue', label: 'Venue' },
  { id: 'gallery', label: 'Gallery' },
];

function App() {
  const [page, setPage] = useState(0);
  const [opened, setOpened] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const audioRef = useRef(null);

  const next = () => setPage((p) => Math.min(p + 1, pages.length - 1));
  const previous = () => setPage((p) => Math.max(p - 1, 0));

  const openInvitation = () => {
    setOpened(true);
    setMusicOn(true);
    // Audio is intentionally optional: a real track can be supplied later.
  };

  useEffect(() => {
    document.body.classList.toggle('is-open', opened);
  }, [opened]);

  const progress = useMemo(() => `${((page + 1) / pages.length) * 100}%`, [page]);

  const handleTouchStart = (event) => setTouchStart(event.changedTouches[0].clientX);
  const handleTouchEnd = (event) => {
    if (touchStart === null) return;
    const delta = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) > 50) delta < 0 ? next() : previous();
    setTouchStart(null);
  };

  if (!opened) {
    return (
      <main className="opening-screen">
        <div className="opening-glow" />
        <section className="opening-card" aria-label="Wedding invitation opening">
          <p className="eyebrow">A celebration of love</p>
          <div className="seal">A<span>&</span>R</div>
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
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="topbar">
        <div className="brand-mark">A <span>×</span> R</div>
        <div className="topbar-right">
          <button className="icon-button" onClick={() => setMusicOn((v) => !v)} aria-label={musicOn ? 'Mute music' : 'Play music'}>
            {musicOn ? '♫' : '♪'}
          </button>
          <span>{page + 1} / {pages.length}</span>
        </div>
      </header>

      <section
        className="book-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Wedding invitation book"
      >
        <div className="book-shadow" />
        <div className="book">
          <div className="paper-back" />
          <div className="paper current-page">
            <PageContent page={pages[page].id} />
          </div>
          <div className={`paper turn-page ${page === 0 ? 'is-first' : ''}`} key={page}>
            <PageContent page={pages[page].id} />
          </div>
        </div>
      </section>

      <nav className="book-controls" aria-label="Invitation navigation">
        <button className="nav-button" onClick={previous} disabled={page === 0}>←</button>
        <div className="progress-wrap">
          <div className="progress-track"><span style={{ width: progress }} /></div>
          <div className="page-label">{pages[page].label}</div>
        </div>
        <button className="nav-button" onClick={next} disabled={page === pages.length - 1}>→</button>
      </nav>

      <div className="keyboard-hint">Swipe or use the arrows to turn the pages</div>
      <audio ref={audioRef} loop aria-hidden="true" />
    </main>
  );
}

function PageContent({ page }) {
  switch (page) {
    case 'couple':
      return <div className="content-page couple-page"><p className="eyebrow">The beginning of forever</p><h2>Alexandra<br /><span>&</span><br />Ryan</h2><p className="body-copy">Two hearts, one beautiful journey. We invite you to celebrate the love, laughter and life we are building together.</p><div className="photo-placeholder portrait">A & R</div><p className="date-line">20 · 12 · 2026</p></div>;
    case 'story':
      return <div className="content-page story-page"><p className="eyebrow">Our story</p><h2>From a hello<br /><em>to forever.</em></h2><div className="story-line"><span>01</span><p>We met, we laughed, and somewhere between ordinary moments, something extraordinary began.</p></div><div className="story-line"><span>02</span><p>Every chapter brought us closer and made us certain that the best stories are the ones written together.</p></div><div className="story-line"><span>03</span><p>Now, surrounded by the people we love, we begin our favourite chapter yet.</p></div></div>;
    case 'events':
      return <div className="content-page"><p className="eyebrow">Save the dates</p><h2>Wedding<br /><em>Celebrations</em></h2><div className="event-list"><Event date="18 DEC" title="Mehendi" time="6:00 PM" /><Event date="19 DEC" title="Wedding Ceremony" time="7:00 PM" /><Event date="20 DEC" title="Reception" time="8:00 PM" /></div></div>;
    case 'venue':
      return <div className="content-page venue-page"><p className="eyebrow">Where we meet</p><h2>The<br /><em>Venue</em></h2><div className="venue-card"><div className="map-placeholder"><span>MAP</span></div><div><h3>The Grand Garden</h3><p>123 Celebration Avenue<br />Mumbai, India</p><button className="text-button">Get directions ↗</button></div></div></div>;
    case 'gallery':
      return <div className="content-page gallery-page"><p className="eyebrow">A few memories</p><h2>Our<br /><em>Moments</em></h2><div className="gallery-grid"><div className="photo-placeholder g-one">01</div><div className="photo-placeholder g-two">02</div><div className="photo-placeholder g-three">03</div><div className="photo-placeholder g-four">04</div></div><a className="whatsapp-button" href="https://wa.me/" target="_blank" rel="noreferrer">RSVP on WhatsApp ↗</a></div>;
    default:
      return <div className="content-page cover-page"><p className="eyebrow">You are invited</p><div className="cover-ornament">❦</div><h2>Alexandra<br /><span>&</span><br />Ryan</h2><p className="script">are getting married</p><div className="cover-date">20 December 2026</div><p className="cover-location">Mumbai · India</p></div>;
  }
}

function Event({ date, title, time }) {
  return <article className="event"><div className="event-date">{date}</div><div><h3>{title}</h3><p>{time}</p></div></article>;
}

createRoot(document.getElementById('root')).render(<App />);
