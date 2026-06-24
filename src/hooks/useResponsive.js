import { useState, useEffect } from 'react';

const BP = { mobile: 640, tablet: 1024 };

export default function useResponsive() {
  const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    let timer;
    const handle = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setWidth(window.innerWidth), 100);
    };
    window.addEventListener('resize', handle);
    return () => { window.removeEventListener('resize', handle); clearTimeout(timer); };
  }, []);

  return {
    width,
    isMobile: width < BP.mobile,
    isTablet: width >= BP.mobile && width < BP.tablet,
    isDesktop: width >= BP.tablet,
    isMobileOrTablet: width < BP.tablet,
    bp: (mobile, tablet, desktop) => {
      if (width < BP.mobile) return mobile;
      if (width < BP.tablet) return tablet;
      return desktop;
    },
  };
}
