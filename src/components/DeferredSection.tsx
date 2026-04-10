import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface DeferredSectionProps {
  children: ReactNode;
  fallback: ReactNode;
  minHeightClassName?: string;
}

export default function DeferredSection({
  children,
  fallback,
  minHeightClassName = 'min-h-[12rem]',
}: DeferredSectionProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldRender) return;

    const node = containerRef.current;
    if (!node) return;

    let cancelled = false;
    let idleHandle: number | null = null;

    const reveal = () => {
      if (!cancelled) {
        setShouldRender(true);
      }
    };

    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            (entries) => {
              if (entries.some((entry) => entry.isIntersecting)) {
                reveal();
                observer.disconnect();
              }
            },
            { rootMargin: '240px 0px' },
          )
        : null;

    observer?.observe(node);

    if (typeof window !== 'undefined') {
      const browserWindow = window as Window & {
        requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
        cancelIdleCallback?: (handle: number) => void;
      };

      if (browserWindow.requestIdleCallback) {
        idleHandle = browserWindow.requestIdleCallback(() => reveal(), { timeout: 1200 });
      } else {
        idleHandle = window.setTimeout(() => reveal(), 700);
      }
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (idleHandle !== null && typeof window !== 'undefined') {
        const browserWindow = window as Window & {
          requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
          cancelIdleCallback?: (handle: number) => void;
        };

        if (browserWindow.cancelIdleCallback) {
          browserWindow.cancelIdleCallback(idleHandle);
        } else {
          window.clearTimeout(idleHandle);
        }
      }
    };
  }, [shouldRender]);

  return <div ref={containerRef} className={minHeightClassName}>{shouldRender ? children : fallback}</div>;
}
