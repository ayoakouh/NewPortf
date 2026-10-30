import { Profiler, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/anton/latin-400.css";
import "@fontsource-variable/inter-tight";
import "@fontsource/jetbrains-mono/latin-400.css";
import "lenis/dist/lenis.css";
import "./styles.css";
import { frames, type Manifest } from "./engine/frames";
import { director, SCENES } from "./engine/director";
import { Stage } from "./components/Stage";
import { Chrome } from "./components/Chrome";
import { Hero } from "./scenes/Hero";
import { About } from "./scenes/About";
import { Work } from "./scenes/Work";
import { Journey } from "./scenes/Journey";
import { Skills } from "./scenes/Skills";
import { Awards } from "./scenes/Awards";
import { Contact } from "./scenes/Contact";
function App() {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  useEffect(() => {
    frames.onManifest = setManifest;
    void frames.init();
    return () => {
      frames.onManifest = undefined;
    };
  }, []);
  useEffect(() => {
    if (!manifest) return;
    director.init(manifest);
    window.__portfolio = {
      seek: (y) => director.seek(y),
      geometry: () => SCENES.map(({ id, top, h }) => ({ id, top, h })),
      snapshot: () => director.state,
      loaded: () => frames.loaded,
    };
    return () => director.destroy();
  }, [manifest]);
  return (
    <>
      <div id="layer-back" className="layer-back" aria-hidden="true" />
      <Stage />
      <div id="layer-front" className="layer-front" aria-hidden="true" />
      <main>
        {manifest && (
          <>
            <Hero />
            <About />
            <Work />
            <Journey />
            <Skills />
            <Awards />
            <Contact />
          </>
        )}
      </main>
      <Chrome />
    </>
  );
}
declare global {
  interface Window {
    __reactCommits: number;
  }
}
window.__reactCommits = 0;
createRoot(document.getElementById("root")!).render(
  import.meta.env.DEV ? (
    <Profiler
      id="portfolio"
      onRender={() => {
        window.__reactCommits++;
      }}
    >
      <App />
    </Profiler>
  ) : (
    <App />
  ),
);
