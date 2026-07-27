import { useEffect, useRef, useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { gsap } from 'gsap';
import './PillNav.css';

export interface PillNavItem {
  label: React.ReactNode;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  exact?: boolean;
}

interface PillNavProps {
  items: PillNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

const PillNav = ({
  items,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#120F17',
  hoveredPillTextColor = '#120F17',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}: PillNavProps) => {
  const routerState = useRouterState();
  const activeHref = routerState.location.pathname;

  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tlRefs = useRef<gsap.core.Timeline[]>([]);
  const activeTweenRefs = useRef<gsap.core.Tween[]>([]);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 0.8, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 0.8, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: '-50%', opacity: 1, duration: 0.8, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const navItems = navItemsRef.current;
      if (navItems) {
        gsap.fromTo(navItems, 
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 1, ease }
        );
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.4,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: -10, scaleY: 0.95 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.4,
            ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: -10,
          scaleY: 0.95,
          duration: 0.3,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    onMobileMenuClick?.();
  };

  const cssVars = {
    ['--base' as string]: baseColor,
    ['--pill-bg' as string]: pillColor,
    ['--hover-text' as string]: hoveredPillTextColor,
    ['--pill-text' as string]: resolvedPillTextColor
  };

  return (
    <div className="pill-nav-container">
      <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars as React.CSSProperties}>

        <div className="pill-nav-items" ref={navItemsRef}>
          <ul className="pill-list desktop-only" role="menubar">
            {items.map((item, i) => {
              const isActive = item.href && (item.exact ? activeHref === item.href : activeHref.startsWith(item.href) && item.href !== '/');
              return (
                <li key={item.href || `item-${i}`} role="none">
                  {item.href ? (
                    <Link
                      role="menuitem"
                      to={item.href}
                      className={`pill${isActive ? ' is-active' : ''}`}
                      aria-label={item.ariaLabel}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                      onClick={item.onClick}
                    >
                      <span
                        className="hover-circle"
                        aria-hidden="true"
                        ref={el => {
                          circleRefs.current[i] = el;
                        }}
                      />
                      <span className="label-stack">
                        <span className="pill-label">{item.label}</span>
                        <span className="pill-label-hover" aria-hidden="true">
                          {item.label}
                        </span>
                      </span>
                    </Link>
                  ) : (
                    <button
                      role="menuitem"
                      className={`pill${isActive ? ' is-active' : ''} bg-transparent border-none`}
                      aria-label={item.ariaLabel}
                      onMouseEnter={() => handleEnter(i)}
                      onMouseLeave={() => handleLeave(i)}
                      onClick={item.onClick}
                    >
                      <span
                        className="hover-circle"
                        aria-hidden="true"
                        ref={el => {
                          circleRefs.current[i] = el;
                        }}
                      />
                      <span className="label-stack">
                        <span className="pill-label">{item.label}</span>
                        <span className="pill-label-hover" aria-hidden="true">
                          {item.label}
                        </span>
                      </span>
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          <button
            className="mobile-menu-button mobile-only"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            ref={hamburgerRef}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars as React.CSSProperties}>
        <ul className="mobile-menu-list">
          {items.map((item, i) => (
            <li key={item.href || `mobile-item-${i}`}>
              {item.href ? (
                <Link
                  to={item.href}
                  className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    item.onClick?.();
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  className="mobile-menu-link w-full text-left bg-transparent border-none"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    item.onClick?.();
                  }}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
