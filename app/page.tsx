'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import Navbar from '@/components/ui/Navbar';
import VideoIntro from '@/components/sections/VideoIntro';
import HeroSection from '@/components/sections/HeroSection';
import AboutSection from '@/components/sections/AboutSection';
import ProjectsSection from '@/components/sections/ProjectsSection';
import WorkExperienceSection from '@/components/sections/WorkExperienceSection';
import PublicationsFooterSection from '@/components/sections/PublicationsFooterSection';
import ScreenLoader from '@/components/sections/ScreenLoader';
import profile from '@/data/profile.json';

const PROJECT_SLIDES = profile.projects.length;
const TOTAL = 7 + PROJECT_SLIDES; // total snap positions including slides

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);
  const idxRef = useRef<number>(0);
  const busyRef = useRef<boolean>(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const loopOverlayRef = useRef<HTMLDivElement>(null);
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    function fadeLoop(targetScrollTop: number, targetIdx: number) {
      busyRef.current = true;
      tweenRef.current?.kill();
      gsap.to(loopOverlayRef.current, {
        opacity: 1,
        duration: 0.55,
        ease: 'power2.in',
        onComplete: () => {
          el!.scrollTop = targetScrollTop;
          idxRef.current = targetIdx;
          gsap.to(loopOverlayRef.current, {
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            delay: 0.05,
            onComplete: () => {
              setTimeout(() => {
                busyRef.current = false;
              }, 300);
            },
          });
        },
      });
    }

    function goTo(idx: number) {
      if (idx >= TOTAL) idx = 0;
      if (idx < 0) idx = TOTAL - 1;

      if (idx === idxRef.current || busyRef.current) return;

      if (idxRef.current === TOTAL - 1 && idx === 0) {
        fadeLoop(0, 0);
        return;
      }

      if (idxRef.current === 0 && idx === TOTAL - 1) {
        fadeLoop((TOTAL - 1) * window.innerHeight, TOTAL - 1);
        return;
      }

      idxRef.current = idx;
      busyRef.current = true;
      tweenRef.current?.kill();
      tweenRef.current = gsap.to(el!, {
        scrollTop: idx * window.innerHeight,
        duration: 0.7,
        ease: 'power2.out',
        onComplete: () => {
          setTimeout(() => {
            busyRef.current = false;
          }, 250);
        },
      });
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (busyRef.current) return;
      goTo(idxRef.current + (e.deltaY > 0 ? 1 : -1));
    }

    let touchY = 0;
    function onTouchStart(e: TouchEvent) {
      touchY = e.touches[0].clientY;
    }
    function onTouchEnd(e: TouchEvent) {
      const dy = touchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 40 || busyRef.current) return;
      goTo(idxRef.current + (dy > 0 ? 1 : -1));
    }

    let wasPastIntro = false;
    function onScroll() {
      const scrollTop = el!.scrollTop;
      idxRef.current = Math.round(scrollTop / window.innerHeight);
      
      const threshold = window.innerHeight * 0.45;
      const isPast = scrollTop > threshold;
      if (isPast && !wasPastIntro) {
        wasPastIntro = true;
        window.dispatchEvent(new Event('scroll-past-intro'));
      } else if (!isPast && wasPastIntro) {
        wasPastIntro = false;
        window.dispatchEvent(new Event('scroll-at-intro'));
      }
    }

    function onFooterLoop() {
      if (busyRef.current) return;
      fadeLoop(0, 0);
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('scroll', onScroll, { passive: true });

    let mTouchY = 0;
    function onMobileTouchStart(e: TouchEvent) {
      mTouchY = e.touches[0].clientY;
    }
    function onMobileTouchEnd(e: TouchEvent) {
      const dy = mTouchY - e.changedTouches[0].clientY;
      if (Math.abs(dy) < 40) return;
      const atBottom = el!.scrollTop + el!.clientHeight >= el!.scrollHeight - 8;
      const atTop = el!.scrollTop < 8;
      if (dy > 0 && atBottom) fadeLoop(0, 0);
      if (dy < 0 && atTop) fadeLoop(el!.scrollHeight - el!.clientHeight, TOTAL - 1);
    }

    if (!isMobile) {
      el.addEventListener('touchstart', onTouchStart, { passive: true });
      el.addEventListener('touchend', onTouchEnd, { passive: true });
    } else {
      el.addEventListener('touchstart', onMobileTouchStart, { passive: true });
      el.addEventListener('touchend', onMobileTouchEnd, { passive: true });
    }
    window.addEventListener('footer-loop-back', onFooterLoop);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('scroll', onScroll);
      if (!isMobile) {
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchend', onTouchEnd);
      } else {
        el.removeEventListener('touchstart', onMobileTouchStart);
        el.removeEventListener('touchend', onMobileTouchEnd);
      }
      window.removeEventListener('footer-loop-back', onFooterLoop);
      tweenRef.current?.kill();
    };
  }, []);

  return (
    <>
      {showLoader && (
        <ScreenLoader onDismiss={() => setShowLoader(false)} />
      )}

      <div
        ref={loopOverlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          zIndex: 9999,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <Navbar />
      <main ref={mainRef} style={{ height: '100vh', overflowY: 'scroll', overscrollBehavior: 'none' }}>
        <div>
          <VideoIntro />
          <HeroSection />
          <AboutSection />
          <ProjectsSection />
          <WorkExperienceSection />
          <PublicationsFooterSection />
        </div>
      </main>
    </>
  );
}
