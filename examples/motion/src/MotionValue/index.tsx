import { motionValue } from "@lynx-js/motion";
import type { MotionValue } from "@lynx-js/motion";
import { root, runOnMainThread, useEffect, useMainThreadRef } from "@lynx-js/react";
import type { MainThread } from "@lynx-js/types";

import "./styles.css";

export default function Basic() {
  const boxMTRef = useMainThreadRef<MainThread.Element>(null);
  const valueMTRef = useMainThreadRef<MotionValue<number>>();
  const directionMTRef = useMainThreadRef(1);
  const intervalMTRef = useMainThreadRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const unsubscribeMTRef = useMainThreadRef<(() => void) | null>(null);

  function bindMotionValueCallback() {
    "main thread";

    valueMTRef.current ??= motionValue(0.5);

    unsubscribeMTRef.current = valueMTRef.current.on("change", (value) => {
      boxMTRef.current?.setStyleProperties({
        transform: `scale(${value})`,
      });
    });
  }

  function startAnimation() {
    "main thread";

    bindMotionValueCallback();

    intervalMTRef.current = setInterval(() => {
      const value = valueMTRef.current;
      if (!value) {
        return;
      }

      const next = value.get() + directionMTRef.current * 0.15;
      if (next >= 1.4 || next <= 0.8) {
        directionMTRef.current *= -1;
      }
      value.set(next);
    }, 1000);
  }

  function endAnimation() {
    "main thread";

    if (intervalMTRef.current) {
      clearInterval(intervalMTRef.current);
      intervalMTRef.current = null;
    }

    if (unsubscribeMTRef.current) {
      unsubscribeMTRef.current();
      unsubscribeMTRef.current = null;
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void runOnMainThread(startAnimation)();
    }, 1000);
    return () => {
      clearTimeout(timeoutId);
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

root.render(<Basic />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
