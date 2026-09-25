"use client";

import { Component, Suspense, lazy, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Bot } from "lucide-react";

const Spline = lazy(() => import("@splinetool/react-spline"));

const ROBOT_SCENE_URL = "https://prod.spline.design/PyzDhpQ9E5f1E3MT/scene.splinecode";

// The Spline runtime + scene is several MB of WebGL that renders every frame and
// swallows touch events, which makes scrolling janky on phones. Only desktops
// with a real mouse get the live 3D scene.
const DESKTOP_QUERY = "(min-width: 1024px) and (pointer: fine)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

// Browsers refuse new WebGL contexts when hardware acceleration is off, or
// after a page has lost its context too many times (Chrome: "Web page caused
// context loss and was blocked"). Probe first so we never hand Spline a dead GPU.
function webglAvailable() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
}

// Spline throws from an effect when it can't create a renderer; without a
// boundary that takes down the whole homepage.
class SceneBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function InteractiveRobot({ className }: { className?: string }) {
  const isDesktop = useIsDesktop();
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "load" | "unsupported">("idle");

  // Don't download the scene until the section is about to scroll into view.
  useEffect(() => {
    const el = ref.current;
    if (!isDesktop || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatus(webglAvailable() ? "load" : "unsupported");
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isDesktop]);

  const placeholder = (
    <div className="flex size-full items-center justify-center">
      <Bot className="size-24 text-background/15" strokeWidth={1.25} aria-hidden />
    </div>
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      {/* Radial mask feathers every edge of the canvas into the section's
          background, so the scene doesn't read as a pasted-in rectangle. */}
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black_55%,transparent_100%)]">
        {isDesktop && status === "load" ? (
          // The canvas is oversized (and still centred) so Spline's "Built with
          // Spline" badge, pinned to its bottom-right corner, lands outside the
          // clipped area instead of needing a colour-matched patch.
          <div className="absolute -inset-x-44 -inset-y-12">
            <SceneBoundary fallback={placeholder}>
              <Suspense fallback={placeholder}>
                <Spline scene={ROBOT_SCENE_URL} className="size-full" />
              </Suspense>
            </SceneBoundary>
          </div>
        ) : (
          placeholder
        )}
      </div>
    </div>
  );
}
