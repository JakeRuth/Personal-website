/* =========================================================
   v1 shared transition wrapper
   Thin layer over shared/transition-cube.js (transition-cube-v4).

   Why this file: every experience + the wizard needs to route between
   experiences via the cube animation. The raw transition-cube API
   exposes both TransitionCubeV4 and (aliased) TransitionCube on window.
   V1Transition.go(url) is the tiny stable seam older call-sites (and
   the topnav) use to fire the transition + cross-page handoff.

   On success: playTransition writes a sessionStorage flag and navigates
   mid-flight. The destination page's TransitionCubeV4.initArrival() then
   plays phase 3 — so the growing→peak→shrinking choreography feels like
   one continuous motion across the page boundary.

   On failure (WebGL or three.js unavailable): we fall back to a plain
   navigation so the flow is never stuck.
   ========================================================= */

(function (global) {
  "use strict";

  function go(url, opts) {
    opts = opts || {};
    try {
      // Prefer the v4 API explicitly — it writes the arrival flag.
      if (global.TransitionCubeV4 && typeof global.TransitionCubeV4.playTransition === "function") {
        global.TransitionCubeV4.playTransition({
          destinationUrl: url,
          onComplete: opts.onComplete
        });
        return;
      }
      // Alias set by transition-cube-v4.js for call-sites that only
      // know the generic name.
      if (global.TransitionCube && typeof global.TransitionCube.playTransition === "function") {
        global.TransitionCube.playTransition({
          destinationUrl: url,
          onComplete: opts.onComplete
        });
        return;
      }
    } catch (e) {
      console.warn("[v1-transition] cube failed, falling back:", e);
    }
    // Hard fallback — navigate immediately.
    window.location.href = url;
  }

  global.V1Transition = { go: go };
})(typeof window !== "undefined" ? window : globalThis);
