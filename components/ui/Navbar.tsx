'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import profile from '@/data/profile.json';
import styles from '@/styles/ui/Navbar.module.css';

/* ── Music bars SVG icons ── */
function MusicPlayingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="1"  y="6"  width="2.5" height="9"  rx="1.25" fill="currentColor" className={styles.bar1} />
      <rect x="5"  y="3"  width="2.5" height="12" rx="1.25" fill="currentColor" className={styles.bar2} />
      <rect x="9"  y="5"  width="2.5" height="10" rx="1.25" fill="currentColor" className={styles.bar3} />
      <rect x="13" y="1"  width="2.5" height="14" rx="1.25" fill="currentColor" className={styles.bar4} />
    </svg>
  );
}

function MusicOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="1"  y="6"  width="2.5" height="9"  rx="1.25" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="5"  y="3"  width="2.5" height="12" rx="1.25" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="9"  y="5"  width="2.5" height="10" rx="1.25" fill="currentColor" stroke="none" opacity="0.3" />
      <rect x="13" y="1"  width="2.5" height="14" rx="1.25" fill="currentColor" stroke="none" opacity="0.3" />
      <line x1="2" y1="2" x2="16" y2="16" strokeWidth="2" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: 'Home',         idx: 0 },
  { label: 'About',        idx: 2 },
  { label: 'Work',         idx: 3 },
  { label: 'Experience',   idx: 6 },
  { label: 'Impact',       idx: 7 },
  { label: 'Contact',      idx: 9 },
];

function getIST() {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).toUpperCase();
}

export default function Navbar() {
  const [time, setTime] = useState(''); // Empty initially to avoid hydration mismatch
  const [onIntro, setOnIntro] = useState(true);
  const [onDark, setOnDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);
  const hidden = useRef(false);
  const stopTimer = useRef<NodeJS.Timeout | null>(null);

  // Listen for when background music starts/stops so button shows correct active state
  useEffect(() => {
    function onMusicStart() { setMusicPlaying(true); }
    function onMusicStop() { setMusicPlaying(false); }
    window.addEventListener('bg-music-started', onMusicStart);
    window.addEventListener('bg-music-stopped', onMusicStop);
    window.addEventListener('bg-music-pause', onMusicStop);
    return () => {
      window.removeEventListener('bg-music-started', onMusicStart);
      window.removeEventListener('bg-music-stopped', onMusicStop);
      window.removeEventListener('bg-music-pause', onMusicStop);
    };
  }, []);

  function toggleMusic() {
    const next = !musicPlaying;
    setMusicPlaying(next);
    window.dispatchEvent(new Event(next ? 'bg-music-play' : 'bg-music-pause'));
  }

  useEffect(() => {
    setTime(getIST());
    const id = setInterval(() => setTime(getIST()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const scroller = document.querySelector('main');
    if (!scroller) return;

    const vh = window.innerHeight;

    function showNavbar() {
      if (!hidden.current) return;
      gsap.to(headerRef.current, { y: '0%', duration: 0.35, ease: 'power2.out' });
      hidden.current = false;
    }

    const onScroll = () => {
      const currentY = scroller.scrollTop;
      const delta = currentY - lastY.current;

      const sectionIdx = Math.round(currentY / vh);
      setOnIntro(currentY < vh * 0.8);
      setOnDark(sectionIdx >= 3);

      if (delta > 8 && !hidden.current) {
        gsap.to(headerRef.current, { y: '-100%', duration: 0.35, ease: 'power2.inOut' });
        hidden.current = true;
      } else if (delta < -6) {
        showNavbar();
      }

      lastY.current = currentY;

      if (stopTimer.current) clearTimeout(stopTimer.current);
      stopTimer.current = setTimeout(showNavbar, 400);
    };

    scroller.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      scroller.removeEventListener('scroll', onScroll);
      if (stopTimer.current) clearTimeout(stopTimer.current);
    };
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`${styles.header} ${onIntro ? styles.introMode : ''} ${onDark ? styles.darkMode : ''}`}
      >
        <span className={styles.time}>INDIA TIME — {time}</span>

        <nav className={styles.navMenu} aria-label="Main Navigation">
          <ul className={styles.navLinks}>
            {NAV_ITEMS.map(({ label, idx }) => (
              <li key={label}>
                <button
                  className={styles.navLink}
                  onClick={() => {
                    const scroller = document.querySelector('main');
                    if (scroller) {
                      gsap.to(scroller, {
                        scrollTop: idx * window.innerHeight,
                        duration: 1.0,
                        ease: 'power3.inOut',
                      });
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.headerRight}>
          <a
            href={`mailto:${profile.email}`}
            className={styles.emailBtn}
          >
            Email me
          </a>

          {/* BG Music toggle button */}
          <button
            className={`${styles.musicBtn} ${musicPlaying ? styles.musicActive : ''}`}
            onClick={toggleMusic}
            aria-label={musicPlaying ? 'Pause background music' : 'Play background music'}
            title={musicPlaying ? 'Pause music' : 'Play music'}
          >
            {musicPlaying ? <MusicPlayingIcon /> : <MusicOffIcon />}
            <span>{musicPlaying ? 'PLAYING' : '♪ MUSIC'}</span>
          </button>

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className={styles.mobileMenu}>
          {NAV_ITEMS.map(({ label, idx }) => (
            <button
              key={label}
              className={styles.mobileNavLink}
              onClick={() => {
                const scroller = document.querySelector('main');
                if (scroller) {
                  gsap.to(scroller, {
                    scrollTop: idx * window.innerHeight,
                    duration: 1.0,
                    ease: 'power3.inOut',
                  });
                }
                setMenuOpen(false);
              }}
            >
              {label}
            </button>
          ))}
          <a
            href={`mailto:${profile.email}`}
            className={styles.mobileMailLink}
            onClick={() => setMenuOpen(false)}
          >
            {profile.email}
          </a>
        </div>
      )}
    </>
  );
}
