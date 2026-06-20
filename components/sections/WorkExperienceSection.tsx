'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from '@/lib/gsap';
import profile from '@/data/profile.json';
import styles from '@/styles/sections/WorkExperienceSection.module.css';

const EXPS = profile.experience;

export default function WorkExperienceSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const bulletListRefs = useRef<(HTMLUListElement | null)[]>([]);
  const collapsedHeights = useRef<number[]>([]);
  const hoverTlsRef = useRef<(gsap.core.Timeline | null)[]>([]);

  // Capture each bullet list's natural collapsed height after first paint
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      bulletListRefs.current.forEach((ul, i) => {
        if (ul) collapsedHeights.current[i] = ul.clientHeight;
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function handleCardEnter(i: number) {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    const dot = dotRefs.current[i];
    hoverTlsRef.current[i]?.kill();
    const tl = gsap.timeline();
    hoverTlsRef.current[i] = tl;
    tl.to(dot, { scale: 1.1, boxShadow: '0 0 0 8px rgba(247,147,30,0.12), 0 0 28px rgba(247,147,30,0.22)', duration: 0.3, ease: 'back.out(2)' }, 0);
  }

  function handleCardLeave(i: number) {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    const dot = dotRefs.current[i];
    hoverTlsRef.current[i]?.kill();
    const tl = gsap.timeline();
    hoverTlsRef.current[i] = tl;
    tl.to(dot, { scale: 1, boxShadow: '0 0 0 6px rgba(247,147,30,0.05), 0 0 22px rgba(247,147,30,0.1)', duration: 0.25, ease: 'power2.in' }, 0);
  }

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !lineRef.current) return;

    function resetAnim() {
      tlRef.current?.kill();
      gsap.set(lineRef.current, { scaleX: 0, transformOrigin: 'left center' });
      dotRefs.current.forEach(el => el && gsap.set(el, { scale: 0, opacity: 0 }));
      cardRefs.current.forEach(el => el && gsap.set(el, { opacity: 0, y: 28 }));
    }

    function playAnim() {
      resetAnim();
      const n = EXPS.length;
      const tl = gsap.timeline();
      tlRef.current = tl;
      tl.to(lineRef.current, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0);
      EXPS.forEach((_, i) => {
        const t = i === 0 ? 0.08 : 0.08 + (i / (n - 1)) * 1.44;
        tl.to(dotRefs.current[i],  { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, t);
        tl.to(cardRefs.current[i], { opacity: 1, y: 0,    duration: 0.6, ease: 'power3.out'  }, t + 0.14);
      });
    }

    resetAnim();

    const observer = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          playAnim();
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      tlRef.current?.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.section} id="experience">
      <div className={styles.bgImg} aria-hidden>
        <Image
          src="/assets/work-experience.webp"
          alt=""
          fill
          quality={100}
          sizes="100vw"
          className={styles.bgImgEl}
        />
      </div>

      <div className={styles.header}>
        <span className={styles.label}>Work Experience</span>
        <span className={styles.labelRight}>0{EXPS.length} Roles</span>
      </div>

      <div className={styles.timeline}>
        <div className={styles.timelineBody}>
          {/* Connector line */}
          <div ref={lineRef} className={styles.snakeLine} />

          {/* Entry list */}
          <div className={styles.entries}>
            {EXPS.map((exp, i) => (
              <div
                key={exp.id}
                className={styles.entry}
                onMouseEnter={() => handleCardEnter(i)}
                onMouseLeave={() => handleCardLeave(i)}
              >
                <div
                  ref={el => { dotRefs.current[i] = el; }}
                  className={styles.dot}
                >
                  <span className={styles.dotNum}>0{i + 1}</span>
                </div>

                <div
                  ref={el => { cardRefs.current[i] = el; }}
                  className={styles.card}
                >
                  <div className={styles.cardHead}>
                    <span className={styles.period}>{exp.period} — {exp.periodEnd}</span>
                    <span className={styles.typeTag}>{exp.type}</span>
                    {exp.location && <span className={styles.location}>{exp.location}</span>}
                  </div>
                  <h2 className={styles.company}>{exp.company}</h2>
                  <p  className={styles.role}>{exp.role}</p>
                  <ul
                    ref={el => { bulletListRefs.current[i] = el; }}
                    className={styles.bullets}
                  >
                    {exp.bullets.map((b, bi) => (
                      <li key={bi} className={styles.bullet}>{b}</li>
                    ))}
                  </ul>
                  <div className={styles.stack}>
                    {exp.tech.map(t => (
                      <span key={t} className={styles.tag}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
