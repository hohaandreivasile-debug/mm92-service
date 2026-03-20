// src/components/ReadAloud.jsx — Text-to-speech button for reading content aloud
import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";

const synth = typeof window !== "undefined" ? window.speechSynthesis : null;

export default function ReadAloud({ text, T, label = "Citește", size = "normal" }) {
  const [state, setState] = useState("idle"); // idle, playing, paused
  const uttRef = useRef(null);

  useEffect(() => {
    return () => { if (synth) synth.cancel(); };
  }, []);

  // Reset when text changes
  useEffect(() => {
    if (synth) synth.cancel();
    setState("idle");
  }, [text]);

  const clean = (t) => (t || "")
    .replace(/[📅📍🏷️🚨⚡⏱️❌🔄📋📝✅🔧👷📌📸💡⚠️✓✗●○▪️▫️━☁️⚙️🛡️🔍🌀🔩⛓️🔗🔌🏠🗼🧭💫🔩🛑💧🎯🌬️📦🖥️🔆🌊🌿🌑🌅🏗️🚪💡🔋⚡🔄]/g, "")
    .replace(/\*\*/g, "").replace(/```[\s\S]*?```/g, "").replace(/`/g, "")
    .replace(/---\s*Pagina\s*\d+\s*---/g, ". Pagina următoare. ")
    .replace(/\n{2,}/g, ". ").replace(/\n/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();

  const speak = () => {
    if (!synth || !text) return;
    const cleaned = clean(text);
    if (!cleaned) return;

    if (state === "playing") {
      synth.pause();
      setState("paused");
      return;
    }
    if (state === "paused") {
      synth.resume();
      setState("playing");
      return;
    }

    synth.cancel();
    const utt = new SpeechSynthesisUtterance(cleaned);
    utt.lang = "ro-RO";
    utt.rate = 1.0;
    utt.pitch = 1.0;

    const voices = synth.getVoices();
    const roVoice = voices.find(v => v.lang.startsWith("ro")) || voices.find(v => v.lang.startsWith("en"));
    if (roVoice) utt.voice = roVoice;

    utt.onstart = () => setState("playing");
    utt.onend = () => setState("idle");
    utt.onerror = () => setState("idle");
    utt.onpause = () => setState("paused");
    utt.onresume = () => setState("playing");

    uttRef.current = utt;
    synth.speak(utt);
  };

  const stop = () => {
    if (synth) synth.cancel();
    setState("idle");
  };

  if (!synth || !text) return null;

  const isSmall = size === "small";
  const iconSize = isSmall ? 14 : 16;

  return (
    <div style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      <button onClick={speak} title={state === "idle" ? "Citește cu voce" : state === "playing" ? "Pauză" : "Continuă"} style={{
        padding: isSmall ? "4px 8px" : "6px 12px",
        border: `1px solid ${state !== "idle" ? T.accent : T.border}`,
        borderRadius: 6, cursor: "pointer", fontSize: isSmall ? 11 : 12,
        fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
        background: state === "playing" ? `${T.accent}18` : T.surface,
        color: state !== "idle" ? T.accent : T.textSec,
        transition: "all 0.15s"
      }}>
        {state === "idle" && <Volume2 size={iconSize} />}
        {state === "playing" && <Pause size={iconSize} />}
        {state === "paused" && <Play size={iconSize} />}
        {!isSmall && (state === "idle" ? label : state === "playing" ? "Pauză" : "Continuă")}
      </button>
      {state !== "idle" && (
        <button onClick={stop} title="Oprește" style={{
          padding: isSmall ? "4px 6px" : "6px 8px",
          border: `1px solid ${T.nok}44`, borderRadius: 6,
          background: `${T.nok}12`, color: T.nok, cursor: "pointer",
          display: "flex", alignItems: "center", fontSize: isSmall ? 11 : 12
        }}>
          <VolumeX size={iconSize} />
        </button>
      )}
    </div>
  );
}
