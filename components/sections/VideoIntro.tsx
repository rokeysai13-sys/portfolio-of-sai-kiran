'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from '@/lib/gsap';
import profile from '@/data/profile.json';
import content from '@/data/content.json';
import styles from '@/styles/sections/VideoIntro.module.css';

const CinematicLayer = dynamic(() => import('@/components/three/CinematicLayer'), { ssr: false });

function scrollNext() {
  const main = document.querySelector('main');
  if (main) main.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
}

export default function VideoIntro() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const greetRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLButtonElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const userPausedMusic = useRef(false);

  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 767px)').matches);
  }, []);

  // Entrance animation
  useEffect(() => {
    let tl: gsap.core.Timeline | null = null;
    function playEntrance() {
      tl = gsap.timeline({ delay: 0.25 });
      tl.fromTo(greetRef.current,  { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
        .fromTo(nameRef.current,   { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }, '-=0.2')
        .fromTo(roleRef.current,   { opacity: 0, y:  20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
        .fromTo(scrollRef.current, { opacity: 0 },         { opacity: 1, duration: 0.5 }, '-=0.1');
    }
    window.addEventListener('loader-animation-done', playEntrance);
    return () => {
      window.removeEventListener('loader-animation-done', playEntrance);
      tl?.kill();
    };
  }, []);

  // Video fade-in
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const t = gsap.fromTo(v, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' });
    return () => { t.kill(); };
  }, []);

  // Unmute when screen loader is dismissed
  useEffect(() => {
    function onLoaderDismissed() {
      const v = videoRef.current;
      const bgV = bgVideoRef.current;
      if (!v) return;
      v.muted = false;
      if (bgV) bgV.muted = true; // Ambient video stays silent
      setMuted(false);
      dismissHint();
    }
    window.addEventListener('loader-dismissed', onLoaderDismissed);
    return () => window.removeEventListener('loader-dismissed', onLoaderDismissed);
  }, []);

  // Play video after shutter animation finishes
  useEffect(() => {
    function onAnimationDone() {
      const v = videoRef.current;
      const bgV = bgVideoRef.current;
      if (v) v.play().catch(() => {});
      if (bgV) bgV.play().catch(() => {});
    }
    window.addEventListener('loader-animation-done', onAnimationDone);
    return () => window.removeEventListener('loader-animation-done', onAnimationDone);
  }, []);

  useEffect(() => {
    if (!showHint) return;
    const id = setTimeout(() => dismissHint(), 6000);
    return () => clearTimeout(id);
  }, [showHint]);

  function dismissHint() {
    if (!hintRef.current) return;
    gsap.to(hintRef.current, {
      opacity: 0,
      y: -8,
      duration: 0.35,
      onComplete: () => setShowHint(false),
    });
  }

  function togglePlay() {
    const v = videoRef.current;
    const bgV = bgVideoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
      if (bgV) bgV.pause();
      setPlaying(false);
    } else {
      v.play().catch(() => {});
      if (bgV) bgV.play().catch(() => {});
      setPlaying(true);
    }
  }

  function toggleMute() {
    if (showHint) dismissHint();
    const v = videoRef.current;
    const bgV = bgVideoRef.current;
    if (!v) return;
    const nextMutedState = !v.muted;
    v.muted = nextMutedState;
    if (bgV) bgV.muted = true; // Background video stays silent
    setMuted(nextMutedState);

    // Sync with background music if playing
    if (bgAudioRef.current) {
      bgAudioRef.current.muted = nextMutedState;
    }
  }

  function handleEnded() {
    const main = document.querySelector('main');
    if (main && main.scrollTop < window.innerHeight * 0.4) scrollNext();

    // Pause ambient video
    if (bgVideoRef.current) {
      bgVideoRef.current.pause();
    }

    // Play background horror track on loop
    if (typeof window !== 'undefined') {
      if (!bgAudioRef.current) {
        const audio = new Audio('/bg_music.mp3');
        audio.loop = true;
        audio.muted = muted;
        bgAudioRef.current = audio;
      }
      bgAudioRef.current.play().catch(e => {
        console.warn('Background audio autoplay was deferred:', e);
      });
      // Notify Navbar that music has started
      window.dispatchEvent(new Event('bg-music-started'));
    }
  }

  // Cleanup background audio when component unmounts
  useEffect(() => {
    return () => {
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
        bgAudioRef.current = null;
      }
    };
  }, []);

  // Listen for global music toggle events dispatched by the Navbar button
  useEffect(() => {
    function onPlay() {
      userPausedMusic.current = false;
      if (!bgAudioRef.current && typeof window !== 'undefined') {
        const audio = new Audio('/bg_music.mp3');
        audio.loop = true;
        audio.muted = muted;
        bgAudioRef.current = audio;
      }
      if (bgAudioRef.current) {
        bgAudioRef.current.play().catch(() => {});
        window.dispatchEvent(new Event('bg-music-started'));
      }
    }
    function onPause() {
      userPausedMusic.current = true;
      if (bgAudioRef.current) {
        bgAudioRef.current.pause();
      }
    }
    window.addEventListener('bg-music-play',  onPlay);
    window.addEventListener('bg-music-pause', onPause);
    return () => {
      window.removeEventListener('bg-music-play',  onPlay);
      window.removeEventListener('bg-music-pause', onPause);
    };
  }, [muted]);

  // Handle scroll events: pause intro video, play background music if not explicitly paused
  useEffect(() => {
    function handleScrollPast() {
      // Pause intro video
      const v = videoRef.current;
      if (v && !v.paused) {
        v.pause();
        setPlaying(false);
      }
      // Pause ambient background video
      if (bgVideoRef.current && !bgVideoRef.current.paused) {
        bgVideoRef.current.pause();
      }
      // Resume or play background music if the user hasn't explicitly clicked stop/pause
      if (!userPausedMusic.current && typeof window !== 'undefined') {
        if (!bgAudioRef.current) {
          const audio = new Audio('/bg_music.mp3');
          audio.loop = true;
          audio.muted = muted;
          bgAudioRef.current = audio;
        }
        if (bgAudioRef.current.paused) {
          bgAudioRef.current.play().catch(e => {
            console.warn('Background audio autoplay was deferred:', e);
          });
          window.dispatchEvent(new Event('bg-music-started'));
        }
      }
    }

    window.addEventListener('scroll-past-intro', handleScrollPast);
    return () => {
      window.removeEventListener('scroll-past-intro', handleScrollPast);
    };
  }, [muted]);

  return (
    <section className={styles.section}>
      {/* Blurred background video */}
      <video
        ref={bgVideoRef}
        src="/video/hero.mp4"
        muted
        loop
        playsInline
        aria-hidden="true"
        className={styles.bgVideo}
      />

      {/* Main viewport video */}
      <video
        ref={videoRef}
        data-testid="intro-video"
        src="/video/hero.mp4"
        muted
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={handleEnded}
        className={styles.mainVideo}
      />

      {/* Gradient Overlay */}
      <div className={styles.overlay} />

      {/* Floating ThreeJS Bokeh particles (Desktop) */}
      {!isMobile && <CinematicLayer />}

      {/* Text overlay */}
      <div className={styles.heroContent}>
        <p ref={greetRef} className={styles.eyebrow}>{content.site.tagline}</p>
        <h1 ref={nameRef} className={styles.name}>
          {profile.name.first}<br />{profile.name.last}
        </h1>
        <p ref={roleRef} className={styles.role}>{profile.roles.detailed}</p>
      </div>

      {/* Interstitial Play button when paused */}
      {!playing && (
        <button className={styles.playOverlay} onClick={togglePlay} aria-label="Play video">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="35" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
            <polygon points="29,20 56,36 29,52" fill="white" />
          </svg>
        </button>
      )}

      {/* Muted hint banner */}
      {showHint && (
        <div ref={hintRef} className={styles.soundHint} onClick={toggleMute} style={{ pointerEvents: 'all', cursor: 'pointer' }}>
          <span className={styles.soundPulse} />
          <span>Tap for sound</span>
        </div>
      )}

      {/* Video controls */}
      <div className={styles.controls}>
        <button className={styles.ctrlBtn} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <rect x="2" y="1" width="4" height="12" rx="1" />
              <rect x="8" y="1" width="4" height="12" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <polygon points="2,1 13,7 2,13" />
            </svg>
          )}
        </button>

        <button className={styles.ctrlBtn} onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M2 5.5h2.5L8 3v10l-3.5-2.5H2V5.5z" fill="currentColor" stroke="none" />
              <line x1="10" y1="5" x2="14" y2="11" />
              <line x1="14" y1="5" x2="10" y2="11" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
              <path d="M2 5.5h2.5L8 3v10l-3.5-2.5H2V5.5z" fill="currentColor" stroke="none" />
              <path d="M10.5 5.5C11.8 6.5 12.5 7.2 12.5 8s-.7 1.5-2 2.5" />
              <path d="M12 3.5C14 5 15 6.4 15 8s-1 3-3 4.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Scroll cues */}
      <button
        ref={scrollRef}
        className={styles.scrollCue}
        onClick={scrollNext}
        aria-label="Scroll to next section"
      >
        <span className={styles.scrollLabel}>Scroll</span>
        <span className={styles.scrollLine} />
      </button>
    </section>
  );
}
