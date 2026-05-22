import { animate } from "@lynx-js/motion";
import { root, runOnMainThread, useEffect, useMainThreadRef } from "@lynx-js/react";
import type { MainThread } from "@lynx-js/types";

import "./styles.css";

export default function Spring() {
  const animateMTRef = useMainThreadRef<ReturnType<typeof animate> | null>(
    null,
  );
  const boxMTRef = useMainThreadRef<MainThread.Element>(null);

  function startAnimation() {
    "main thread";

    if (boxMTRef.current) {
      animateMTRef.current = animate(
        boxMTRef.current,
        { rotate: 90 },
        { type: "spring", repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.2 },
      );
    }
  }

  function endAnimation() {
    "main thread";

    animateMTRef.current?.stop();
  }

  useEffect(() => {
    void runOnMainThread(startAnimation)();
    return () => {
      void runOnMainThread(endAnimation)();
    };
  }, []);

  return (
    <view className="case-container lunaris-dark">
      <view
        className="motion-box"
        main-thread:ref={boxMTRef}
      >
      </view>
    </view>
  );
}

root.render(<Spring />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
