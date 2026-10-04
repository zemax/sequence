import { ReactNode, useEffect, useState } from "react";
import { Location, useLocation } from "react-router";
import classNames from "classnames";

import styles from "./ScreenTransition.module.scss";

const FADE_MS = 120;

type Props = {
  children: (location: Location) => ReactNode;
};

// The gradient sits outside the fading element, so only the screen's content fades, not the background.
export const ScreenTransition = ({ children }: Props) => {
  const location = useLocation();
  const [displayed, setDisplayed] = useState(location);
  const leaving = location.pathname !== displayed.pathname;

  useEffect(() => {
    if (!leaving) {
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = setTimeout(() => setDisplayed(location), reducedMotion ? 0 : FADE_MS);
    return () => clearTimeout(timeout);
  }, [leaving, location]);

  return (
    <div className={styles.background}>
      <div key={displayed.pathname} className={classNames(styles.screen, leaving && styles.leaving)}>
        {children(displayed)}
      </div>
    </div>
  );
};
