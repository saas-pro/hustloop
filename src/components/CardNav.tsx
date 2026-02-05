import React, { useLayoutEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
// use your own icon import if react-icons is not available
import { GoArrowUpRight } from 'react-icons/go';

type CardNavLink = {
  label: string;
  href: string;
  ariaLabel: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  isHighlighted?: boolean; // For special styling like Early Bird
  styleVariant?: 'primary' | 'secondary' | 'default'; // For auth buttons styling
  icon?: React.ReactNode; // Optional icon to display with the link
  iconOnly?: boolean; // If true, only show the icon without the label
};

export type CardNavItem = {
  label: string;
  bgColor: string;
  textColor: string;
  links: CardNavLink[];
};

export interface CardNavProps {
  logo?: string;
  logoAlt?: string;
  brandLogo?: React.ReactElement;
  items: CardNavItem[];
  className?: string;
  ease?: string;
  baseColor?: string;
  menuColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  themeToggle?: React.ReactElement;
}

const CardNav: React.FC<CardNavProps> = ({
  logo,
  logoAlt = 'Logo',
  brandLogo,
  items,
  className = '',
  ease = 'power3.out',
  baseColor = '#fff',
  menuColor,
  buttonBgColor,
  buttonTextColor,
  themeToggle
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLAnchorElement[]>([]);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const calculateHeight = () => {
    // Fixed height of 540px when navbar is open
    return 540;
  };

  const createTimeline = useCallback(() => {
    const navEl = navRef.current;
    if (!navEl) return null;

    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.25,
      ease
    });

    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.25, ease, stagger: 0.04 }, '-=0.15');

    return tl;
  }, [ease]);

  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;

    return () => {
      tl?.kill();
      tlRef.current = null;
    };
  }, [ease, items, createTimeline]);

  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isExpanded, createTimeline]);



  const toggleMenu = () => {
    const tl = tlRef.current;
    if (!tl) return;

    // If animation is currently running, don't allow toggle
    if (tl.isActive()) {
      return;
    }

    if (!isExpanded) {
      setIsHamburgerOpen(true);
      setIsExpanded(true);
      // Clear any previous callbacks
      tl.eventCallback('onReverseComplete', null);
      tl.eventCallback('onComplete', null);
      // Restart from beginning
      tl.restart();
    } else {
      setIsHamburgerOpen(false);
      // Update state immediately instead of waiting for callback
      setIsExpanded(false);
      // Reverse the animation
      tl.reverse();
    }
  };

  const setCardRef = (i: number) => (el: HTMLAnchorElement | null) => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div
      className={`card-nav-container absolute left-1/2 -translate-x-1/2 w-[95%] max-w-[800px] z-[99] top-[1.2em] md:top-[2em] pointer-events-auto ${className}`}
    >
      <nav
        ref={navRef}
        className={`card-nav ${isExpanded ? 'open' : ''} block h-[50px] p-0 rounded-xl shadow-md relative overflow-hidden will-change-[height] bg-card/60 backdrop-blur-2xl border border-border`}
      >
        <div className="card-nav-top absolute inset-x-0 top-0 h-[60px] flex items-center justify-between p-2 pl-[1.1rem] z-[2]">
          <div className="flex items-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 order-1 md:order-none">
            {brandLogo ? brandLogo : logo ? <Image src={logo} alt={logoAlt} width={100} height={28} className="logo h-[28px] w-auto" /> : null}
          </div>

          <div className="flex items-center gap-0 order-2 md:order-none mr-2">
            {themeToggle && (
              <div className="theme-toggle-container mr-2">
                {themeToggle}
              </div>
            )}
            <div
              className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''} group h-full flex flex-col items-center justify-center cursor-pointer gap-[6px] text-foreground`}
              onClick={toggleMenu}
              role="button"
              aria-label={isExpanded ? 'Close menu' : 'Open menu'}
              tabIndex={0}
            >
              <div
                className={`hamburger-line w-[25px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${isHamburgerOpen ? 'translate-y-[4px] rotate-45' : ''
                  } group-hover:opacity-75`}
              />
              <div
                className={`hamburger-line w-[25px] h-[2px] bg-current transition-[transform,opacity,margin] duration-300 ease-linear [transform-origin:50%_50%] ${isHamburgerOpen ? '-translate-y-[4px] -rotate-45' : ''
                  } group-hover:opacity-75`}
              />
            </div>
          </div>
        </div>

        <div
          className={`card-nav-content absolute left-0 right-0 top-[60px] p-3 flex flex-col justify-between z-[1] overflow-y-auto ${isExpanded ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
            }`}
          aria-hidden={!isExpanded}
        >
          {(() => {
            let linkIndex = 0; // Track global link index across all sections
            const allSections = (items || []).map((item, idx) => {
              const sectionLinks = item.links?.map((lnk, i) => {
                const currentIndex = linkIndex++;
                return (
                  <a
                    key={`${lnk.label}-${i}`}
                    ref={setCardRef(currentIndex)}
                    className={`nav-link text-base transition-all duration-200 cursor-pointer ${lnk.iconOnly
                      ? 'flex items-center justify-center w-12 h-12 p-0'
                      : lnk.icon
                        ? 'flex items-center justify-between px-4 py-2'
                        : 'block px-4 py-2'
                      } ${lnk.styleVariant === 'primary'
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-full text-center'
                        : lnk.styleVariant === 'secondary'
                          ? 'bg-secondary text-secondary-foreground mt-2 hover:bg-secondary/80 font-medium rounded-full text-center'
                          : lnk.isHighlighted
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90 font-medium rounded-md'
                            : 'text-muted-foreground hover:text-primary hover:bg-accent/50 rounded-md'
                      }`}
                    href={lnk.href}
                    aria-label={lnk.ariaLabel}
                    onClick={(e) => {
                      // Call the original onClick handler if it exists
                      if (lnk.onClick) {
                        lnk.onClick(e);
                      }
                      // Close the menu after clicking any link
                      if (isExpanded) {
                        toggleMenu();
                      }
                    }}
                  >
                    {lnk.iconOnly ? (
                      lnk.icon
                    ) : (
                      <>
                        <span>{lnk.label}</span>
                        {lnk.icon && <span className="icon">{lnk.icon}</span>}
                      </>
                    )
                    }
                  </a>
                );
              });

              // Check if all links in this section are icon-only
              const allIconOnly = item.links?.every(lnk => lnk.iconOnly) ?? false;

              return (
                <div
                  key={`${item.label}-${idx}`}
                  className={`nav-section ${allIconOnly ? 'flex flex-row items-center justify-between gap-2' : ''}`}
                >
                  {sectionLinks}
                </div>
              );
            });

            // Split sections: all except last go in top group, last goes at bottom
            const topSections = allSections.slice(0, -1);
            const bottomSection = allSections[allSections.length - 1];

            return (
              <>
                <div className="flex flex-col gap-1">
                  {topSections.map((section, idx) => (
                    <React.Fragment key={idx}>
                      {section}
                      {idx === 0 && <div className="my-2 border-t border-border" />}
                    </React.Fragment>
                  ))}
                </div>
                {bottomSection && (
                  <div className="mt-2 pt-2 border-border">
                    {bottomSection}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </nav >
    </div >
  );
};

export default CardNav;
