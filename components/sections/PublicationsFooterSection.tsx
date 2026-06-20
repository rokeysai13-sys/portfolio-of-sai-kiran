'use client';

import { useEffect, useRef, Fragment, useState } from 'react';
import Image from 'next/image';
import * as THREE from 'three';
import { gsap } from '@/lib/gsap';

import profile from '@/data/profile.json';
import content from '@/data/content.json';
import styles from '@/styles/sections/PublicationsFooterSection.module.css';

const PUBS = profile.publications;

// SVG Icons replacement
const GitHubIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const LinkedInIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const InstagramIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YouTubeIcon = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.524 3.545 12 3.545 12 3.545s-7.525 0-9.388.51a3.002 3.002 0 0 0-2.11 2.108C0 8.024 0 12 0 12s0 3.976.502 5.837a3.003 3.003 0 0 0 2.11 2.108c1.863.51 9.388.51 9.388.51s7.525 0 9.388-.51a3.002 3.002 0 0 0 2.11-2.108c.502-1.861.502-5.837.502-5.837s0-3.976-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const EnvelopeIcon = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ArrowIcon = ({ size = 11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

const ChevronDownIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  GitHub: <GitHubIcon size={13} />,
  LinkedIn: <LinkedInIcon size={13} />,
  Instagram: <InstagramIcon size={13} />,
  YouTube: <YouTubeIcon size={13} />,
};

const MOBILE_SOCIAL_ICONS: Record<string, React.ReactNode> = {
  GitHub: <GitHubIcon size={20} />,
  LinkedIn: <LinkedInIcon size={20} />,
  Instagram: <InstagramIcon size={20} />,
};

const HERO_SOCIAL_LABELS = ['GitHub', 'LinkedIn', 'Instagram'];

const VID_VERT = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const VID_FRAG = `
  uniform sampler2D uVideo;
  uniform float uOpacity;
  uniform float uVideoAspect;
  uniform float uCanvasAspect;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    if (uCanvasAspect > uVideoAspect) {
      float s = uVideoAspect / uCanvasAspect;
      uv.y = (vUv.y - 0.5) * s + 0.5;
    } else {
      float s = uCanvasAspect / uVideoAspect;
      uv.x = (vUv.x - 0.5) * s + 0.5;
    }
    vec4 tex = texture2D(uVideo, uv);
    float fadeY =
      smoothstep(0.0, 0.05, uv.y) *
      smoothstep(1.0, 0.95, uv.y);
    float alpha = fadeY * uOpacity;
    float lum = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 col = mix(vec3(lum), tex.rgb, 0.72);
    float vx = smoothstep(0.0, 0.38, abs(uv.x - 0.5) * 2.0);
    vec3 dark = vec3(0.008, 0.008, 0.008);
    col = mix(col, dark, vx * 0.82);
    col *= 0.68;
    gl_FragColor = vec4(col, alpha);
  }
`;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export default function PublicationsFooterSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef  = useRef<HTMLDivElement>(null);

  // image
  const imageWrapRef    = useRef<HTMLDivElement>(null);
  const imageOverlayRef = useRef<HTMLDivElement>(null);

  // publication content
  const pubContentRef = useRef<HTMLDivElement>(null);
  const labelRef      = useRef<HTMLParagraphElement>(null);
  const headingRef    = useRef<HTMLHeadingElement>(null);
  const dividerRef    = useRef<HTMLDivElement>(null);
  const itemRefs      = useRef<(HTMLAnchorElement | null)[]>([]);

  // image-only interstitial
  const interstitialRef = useRef<HTMLDivElement>(null);

  // footer
  const canvasRef         = useRef<HTMLCanvasElement>(null);
  const videoSrcRef       = useRef<HTMLVideoElement>(null);
  const footerContentRef  = useRef<HTMLDivElement>(null);
  const leftRef         = useRef<HTMLDivElement>(null);
  const rightRef        = useRef<HTMLDivElement>(null);
  const bigNameRef      = useRef<HTMLDivElement>(null);
  const bottomBarRef    = useRef<HTMLDivElement>(null);

  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    const wrapper       = wrapperRef.current;
    const sticky        = stickyRef.current;
    const canvas        = canvasRef.current;
    const videoEl       = videoSrcRef.current;
    const scroller      = document.querySelector('main');
    if (!wrapper || !sticky || !scroller) return;

    const isMobile = window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer, vidUni: any, rafId: number, videoPlaying = false;
    let sectionObserver: IntersectionObserver | null = null;
    let onMouseMove = (e: MouseEvent) => {};
    let onResize = () => {};

    if (!isMobile && canvas && videoEl) {
      const W = sticky.offsetWidth;
      const H = sticky.offsetHeight;

      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(1);
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);

      const scene  = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 100);
      camera.position.z = 10;

      videoEl.src       = '/video/hero.mp4'; // Use main background video for crossfade in footer
      videoEl.muted     = true;
      videoEl.playsInline = true;
      videoEl.loop      = true;
      videoEl.preload   = 'auto';

      const vidTex = new THREE.VideoTexture(videoEl);
      vidTex.minFilter = THREE.LinearFilter;
      vidTex.magFilter = THREE.LinearFilter;

      vidUni = {
        uVideo:       { value: vidTex },
        uOpacity:     { value: 0 },
        uVideoAspect: { value: 16 / 9 },
        uCanvasAspect: { value: W / H },
      };
      videoEl.addEventListener('loadedmetadata', () => {
        if (videoEl.videoWidth && videoEl.videoHeight)
          vidUni.uVideoAspect.value = videoEl.videoWidth / videoEl.videoHeight;
      }, { once: true });
      const vidMat = new THREE.ShaderMaterial({
        uniforms: vidUni,
        vertexShader: VID_VERT,
        fragmentShader: VID_FRAG,
        transparent: true,
      });
      const vidMesh = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.08, H * 1.08), vidMat);
      vidMesh.position.z = 1;
      scene.add(vidMesh);

      const mx = { tx: 0, ty: 0, x: 0, y: 0 };
      onMouseMove = function(e: MouseEvent) {
        const r = sticky.getBoundingClientRect();
        mx.tx = (e.clientX - r.left) / r.width  - 0.5;
        mx.ty = (e.clientY - r.top)  / r.height - 0.5;
      };
      sticky.addEventListener('mousemove', onMouseMove);

      onResize = function() {
        const w = sticky.offsetWidth;
        const h = sticky.offsetHeight;
        renderer.setSize(w, h);
        camera.left   = -w / 2; camera.right  = w / 2;
        camera.top    =  h / 2; camera.bottom = -h / 2;
        camera.updateProjectionMatrix();
        vidUni.uCanvasAspect.value = w / h;
      };
      window.addEventListener('resize', onResize);

      let isVisible = false;
      sectionObserver = new IntersectionObserver(([entry]) => {
        isVisible = entry.isIntersecting;
      }, { threshold: 0 });
      sectionObserver.observe(sticky);

      let lastRenderedPlaying = false;
      function tick() {
        rafId = requestAnimationFrame(tick);
        if (!isVisible) return;
        mx.x += (mx.tx - mx.x) * 0.04;
        mx.y += (mx.ty - mx.y) * 0.04;
        vidMesh.position.x = mx.x * 14;
        vidMesh.position.y = mx.y * -8;
        if (videoPlaying) {
          vidTex.needsUpdate = true;
          renderer.render(scene, camera);
          lastRenderedPlaying = true;
        } else if (lastRenderedPlaying) {
          renderer.render(scene, camera);
          lastRenderedPlaying = false;
        }
      }
      tick();
    }

    // Publication entry animation
    let pubAnimDone = false;

    function resetPubAnim() {
      pubAnimDone = false;
      gsap.set(labelRef.current,   { opacity: 0, y: -16, rotateX: 40, transformPerspective: 500, transformOrigin: '50% 0%' });
      gsap.set(headingRef.current, { opacity: 0, y: -30, rotateX: 35, transformPerspective: 700, transformOrigin: '50% 0%' });
      gsap.set(dividerRef.current, { scaleX: 0, transformOrigin: 'left center' });
      itemRefs.current.forEach(el => {
        if (el) gsap.set(el, { opacity: 0, y: 28, rotateX: 18, transformPerspective: 900, transformOrigin: '50% 0%' });
      });
    }

    function playPubAnim() {
      if (pubAnimDone) return;
      pubAnimDone = true;
      gsap.to(labelRef.current,   { opacity: 1, y: 0, rotateX: 0, duration: 0.55, ease: 'power3.out' });
      gsap.to(headingRef.current, { opacity: 1, y: 0, rotateX: 0, duration: 0.75, ease: 'expo.out', delay: 0.08 });
      gsap.to(dividerRef.current, { scaleX: 1, duration: 0.7, ease: 'power2.inOut', delay: 0.25 });
      itemRefs.current.forEach((el, i) => {
        if (el) gsap.to(el, { opacity: 1, y: 0, rotateX: 0, duration: 0.6, ease: 'power3.out', delay: 0.32 + i * 0.1 });
      });
    }

    // Initial image position
    function setImageLeft() {
      const vw = window.innerWidth;
      const imgWrapEl = imageWrapRef.current;
      if (imgWrapEl) {
        imgWrapEl.style.width = `${vw}px`;
        imgWrapEl.style.transform = 'translate3d(0, 0, 0)';
        imgWrapEl.style.opacity = '1';
      }
      const imgOverlayEl = imageOverlayRef.current;
      if (imgOverlayEl) {
        imgOverlayEl.style.opacity = '1';
      }
    }

    // Scroll snapping triggers
    let lastP = -1;
    function onScroll() {
      const vh   = window.innerHeight;
      const dist = -wrapper!.getBoundingClientRect().top;

      const p = Math.max(0, Math.min(1, dist / (2 * vh)));

      if (p === lastP) {
        return;
      }
      lastP = p;

      if (p === 0) {
        setImageLeft();
      }

      // Phase 1: publications fade
      const pubFadeEnd = isMobile ? 0.25 : 0.28;
      const pubFade = 1 - Math.max(0, Math.min(1, p / pubFadeEnd));
      
      const pubEl = pubContentRef.current;
      if (pubEl) {
        pubEl.style.opacity = String(pubFade);
        pubEl.style.pointerEvents = pubFade > 0.05 ? 'auto' : 'none';
      }

      const vw = window.innerWidth;

      if (isMobile) {
        // Interstitial mobile fades
        const interIn  = Math.max(0, Math.min(1, (p - 0.28) / 0.17));
        const interOut = Math.max(0, Math.min(1, (p - 0.60) / 0.12));
        const interEl = interstitialRef.current;
        if (interEl) {
          interEl.style.opacity = String(interIn * (1 - interOut));
          interEl.style.pointerEvents = 'none';
        }
      } else {
        // Phase 2: image shrinks and centers
        const imgRaw = Math.max(0, Math.min(1, (p - 0.12) / 0.53));
        const imgP   = easeInOut(imgRaw);

        const startW  = vw;
        const endW    = vw * 0.46;
        const w       = startW + imgP * (endW - startW);
        const centerX = imgP * (vw - w) / 2;

        const imgOverlayEl = imageOverlayRef.current;
        if (imgOverlayEl) {
          imgOverlayEl.style.opacity = String(1 - imgP);
        }

        // Interstitial
        const interIn  = Math.max(0, Math.min(1, (p - 0.25) / 0.15));
        const interOut = Math.max(0, Math.min(1, (p - 0.54) / 0.14));
        const interEl = interstitialRef.current;
        if (interEl) {
          interEl.style.opacity = String(interIn * (1 - interOut));
          interEl.style.pointerEvents = 'none';
        }

        // Phase 3: crossfade image to video
        const xfadeRaw = Math.max(0, Math.min(1, (p - 0.65) / 0.27));
        const xfade    = 0.5 - 0.5 * Math.cos(Math.PI * xfadeRaw);

        const imgWrapEl = imageWrapRef.current;
        if (imgWrapEl) {
          imgWrapEl.style.width = `${w}px`;
          imgWrapEl.style.transform = `translate3d(${centerX}px, 0, 0)`;
          imgWrapEl.style.opacity = String(1 - xfade);
        }
        
        if (vidUni) vidUni.uOpacity.value = xfade;

        if (xfade > 0.04 && !videoPlaying) {
          videoPlaying = true;
          videoEl?.play().catch(() => {});
        } else if (xfade <= 0.04 && videoPlaying) {
          videoPlaying = false;
          if (videoEl) {
            videoEl.pause();
            videoEl.currentTime = 0;
          }
        }
      }

      // Footer content fade
      const footerStart = isMobile ? 0.72 : 0.75;
      const footerRange = isMobile ? 0.20 : 0.25;
      const footerFade = Math.max(0, Math.min(1, (p - footerStart) / footerRange));
      const footerContentEl = footerContentRef.current;
      if (footerContentEl) {
        footerContentEl.style.opacity = String(footerFade);
        footerContentEl.style.pointerEvents = footerFade > 0.05 ? 'auto' : 'none';
      }
    }

    resetPubAnim();
    setImageLeft();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const pubObserver = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          playPubAnim();
          pubObserver.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (pubContentRef.current) pubObserver.observe(pubContentRef.current);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      scroller.removeEventListener('scroll', onScroll);
      sticky.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      pubObserver.disconnect();
      if (sectionObserver) sectionObserver.disconnect();
      if (renderer) renderer.dispose();
    };
  }, []);

  const year = new Date().getFullYear();

  return (
    <div ref={wrapperRef} className={styles.wrapper} id="impact">
      <div ref={stickyRef} className={styles.sticky}>
        {/* ThreeJS video canvas */}
        <canvas ref={canvasRef} className={styles.glCanvas} />
        <video ref={videoSrcRef} className={styles.hiddenVideo} />

        {/* Mobile footer backup background */}
        <div className={styles.mobileFooterBg}>
          <Image
            src="/assets/work-experience.webp"
            alt=""
            fill
            quality={100}
            className={styles.mobileFooterBgImg}
            sizes="100vw"
            priority={false}
          />
        </div>

        <div className={styles.mobileDarkOverlay} aria-hidden />

        {/* Shrinking floating image */}
        <div ref={imageWrapRef} className={styles.imageWrap}>
          <Image
            src="/assets/sai-footer.jpeg"
            alt=""
            fill
            quality={100}
            className={styles.imageEl}
            sizes="(max-width: 767px) 100vw, 50vw"
            priority={false}
          />
          <div ref={imageOverlayRef} className={styles.imageOverlay} />
        </div>

        {/* Publications List */}
        <div ref={pubContentRef} className={styles.pubContent}>
          <span className={styles.watermark} aria-hidden>IMPACT</span>

          <div className={styles.pubHero}>
            <p ref={labelRef} className={styles.label}>AI &amp; Automation</p>
            <h2 ref={headingRef} className={styles.heading}>Key Initiatives</h2>
          </div>

          <div ref={dividerRef} className={styles.divider} />

          <div className={styles.list}>
            {PUBS.map((pub, i) => (
              <a
                key={pub.id}
                href={pub.link}
                target="_blank"
                rel="noopener noreferrer"
                ref={el => { itemRefs.current[i] = el; }}
                className={styles.item}
              >
                <div className={styles.num}>0{i + 1}.</div>
                <div className={styles.itemBody}>
                  <div className={styles.itemTop}>
                    <h3 className={styles.title}>{pub.title}</h3>
                    <span className={styles.platform}>{pub.platform}</span>
                  </div>
                  <p className={styles.desc}>{pub.desc}</p>
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.year}>{pub.year}</span>
                  <span className={styles.readBtn}>
                    View <ArrowIcon size={11} />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Stat strip (Phase 2 Interstitial) */}
        <div ref={interstitialRef} className={styles.interstitial} aria-hidden>
          <div className={styles.interstitialLeft}>
            <div className={styles.interStat}>
              <span className={styles.interLabel}>{content.interstitial.availabilityLabel}</span>
              <span className={styles.interBig}>{profile.location.availability}</span>
            </div>
            <div className={styles.interDividerH} />
            <div className={styles.interStat}>
              <span className={styles.interLabel}>{content.interstitial.basedInLabel}</span>
              <span className={styles.interBig}>{profile.location.based}</span>
            </div>
          </div>

          <div className={styles.interstitialRight}>
            {profile.stats.map((stat, i) => (
              <Fragment key={stat.label}>
                {i > 0 && <div className={styles.interDividerV} />}
                <div className={styles.interNum}>
                  <span className={styles.interCount}>{stat.value}</span>
                  <span className={styles.interNumLabel}>
                    {(content.interstitial.statLabels[i] ?? stat.label).split('\n').map((line, j) => (
                      <Fragment key={j}>{line}{j === 0 && <br />}</Fragment>
                    ))}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>

          <div className={styles.interstitialBottom}>
            <span className={styles.interScrollText}>Continue</span>
            <span className={styles.interScrollLine} />
          </div>
        </div>

        <div className={styles.vignetteOverlay} aria-hidden />

        {/* Footer phase layout */}
        <div ref={footerContentRef} className={styles.footerContent} id="contact">
          {/* Mobile footer brand info */}
          <div className={styles.mobileLayout}>
            <div className={styles.mobileBrand}>
              <span className={styles.mobileRoleDot} />
              <span className={styles.mobileRoleText}>{profile.roles.short.toUpperCase()}</span>
            </div>
            <h2 className={styles.mobileName}>
              {profile.name.first.toUpperCase()}
              <br />
              <span className={styles.mobileNameGhost}>{profile.name.last.toUpperCase()}</span>
            </h2>
            <p className={styles.mobileDesc}>{profile.description}</p>
            <div className={styles.mobileCtas}>
              <a href={`mailto:${profile.email}`} className={styles.mobileTalkBtn}>
                Let&apos;s talk <ArrowIcon />
              </a>
            </div>
            <div className={styles.mobileSocialRow}>
              {HERO_SOCIAL_LABELS.map((label, i) => {
                const s = profile.socials.find(social => social.label === label);
                if (!s) return null;
                return (
                  <Fragment key={label}>
                    {i > 0 && <div className={styles.mobileSocialDivider} aria-hidden />}
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className={styles.mobileSocialLink} aria-label={label}>
                      <span className={styles.mobileSocialLabelEl}>{label.toUpperCase()}</span>
                    </a>
                  </Fragment>
                );
              })}
            </div>
            <div className={styles.mobileScrollHint} aria-hidden>
              <ChevronDownIcon size={18} />
              <span className={styles.mobileScrollText}>Scroll to explore</span>
            </div>
          </div>

          <div className={styles.mainGrid}>
            <div ref={leftRef} className={styles.leftCol}>
              <div className={styles.identityBlock}>
                <p className={styles.greetLine}>
                  <span className={styles.greetDot} />
                  {greeting}
                </p>
                <p className={styles.roleLabel}>{profile.roles.short}</p>
                <h2 className={styles.nameHeading}>
                  {profile.name.first}
                  <br />
                  <span className={styles.nameGhost}>{profile.name.last}</span>
                </h2>
              </div>

              <div className={styles.footerInfo}>
                <p className={styles.footerDescription}>{profile.description}</p>
                <div className={styles.footerLinks}>
                  {profile.socials.slice(0, 4).map((s, i) => (
                    <span key={s.label} className={styles.footerLinkWrap}>
                      {i > 0 && <span className={styles.footerPipe}>|</span>}
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.footerLink}
                      >
                        {s.label}
                      </a>
                    </span>
                  ))}
                </div>
                <a href={`mailto:${profile.email}`} className={styles.footerMail}>
                  <EnvelopeIcon size={12} />
                  {profile.email}
                </a>
              </div>
            </div>

            <div className={styles.centerSpace} />

            <div ref={rightRef} className={styles.rightCol}>
              <div className={styles.ctaBlock}>
                <p className={styles.ctaEyebrow}>{content.footer.eyebrow}</p>
                <p className={styles.ctaHeading}>
                  {content.footer.ctaLines.map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                  <span className={styles.ctaAccent}>{content.footer.ctaAccent}</span>
                </p>
                <a href={`mailto:${profile.email}`} className={styles.talkBtn}>
                  Let&apos;s talk
                </a>
              </div>
            </div>
          </div>

          <div ref={bigNameRef} className={styles.signatureWrap}>
            <h2 className={styles.signatureText}>{profile.name.full.toUpperCase()}</h2>
          </div>

          <div ref={bottomBarRef} className={styles.bottomBar}>
            <div className={styles.bottomLeft}>
              <div className={styles.monogram}>
                <span className={styles.monoLetters}>SK</span>
                <span className={styles.monoDot} />
              </div>
              <span className={styles.leftDivider} />
              <div className={styles.copyBlock}>
                <p className={styles.copy}>© {year} {profile.name.full.toUpperCase()}</p>
                <p className={styles.copyAll}>ALL RIGHTS RESERVED</p>
              </div>
            </div>
            <div className={styles.bottomRight}>
              <span className={styles.builtWith}>
                DESIGNED &amp; DEVELOPED
                <br />
                WITH PRECISION.
              </span>
              <span className={styles.barDivider} />
              <span className={styles.sunIcon}>*</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
