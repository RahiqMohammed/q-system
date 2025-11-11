import React, { useEffect, useRef, useState, useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

type Patient = { prefix?: string; number: string | number; name: string; lang?: "ar" | "en" };
type Counter = { id: string | number; name: string; currentPatient?: Patient | null; nextPatients?: Patient[] };

export default function QueueTVFinal() {
const location = useLocation();
const incoming = (location.state as any)?.countersData as Counter[] | undefined;

const fallback: Counter[] = useMemo(() => [
{
id: "c1",
name: "Radiology - Room 1",
currentPatient: { prefix: "R", number: 101, name: "أحمد علي", lang: "ar" },
nextPatients: [
{ prefix: "R", number: 102, name: "محمد سالم", lang: "ar" },
{ prefix: "R", number: 103, name: "Aisha Saeed", lang: "en" },
{ prefix: "R", number: 104, name: "هند عبدالله", lang: "ar" },
{ prefix: "R", number: 105, name: "Saeed Ali", lang: "en" },
],
},
{
id: "c2",
name: "Pharmacy - Window 1",
currentPatient: { prefix: "P", number: 201, name: "رحيق الحضرمي", lang: "ar" },
nextPatients: [
{ prefix: "P", number: 202, name: "عبدالعزيز خميس", lang: "ar" },
{ prefix: "P", number: 203, name: "Mona Salem", lang: "en" },
],
},
{
id: "c3",
name: "Billing - Counter 1",
currentPatient: { prefix: "B", number: 301, name: "عبدالله ناصر", lang: "ar" },
nextPatients: [
{ prefix: "B", number: 302, name: "هند علي", lang: "ar" },
{ prefix: "B", number: 303, name: "Saeed Hamd", lang: "en" },
],
},
], []);

const dataToRender: Counter[] = incoming && incoming.length ? incoming : fallback;

const columns = useMemo(() => {
const n = dataToRender.length;
if (n <= 1) return 1;
if (n <= 4) return 2;
if (n <= 9) return 3;
return 4;
}, [dataToRender.length]);

const palette = useMemo(() => [
{ from: "#083249", to: "#0b4f6c", accent: "#18C3B3" },
{ from: "#3b2f63", to: "#4b3b8a", accent: "#FF9F1C" },
{ from: "#1b3a3a", to: "#1f6f6f", accent: "#61D03A" },
{ from: "#2f2b4f", to: "#40367a", accent: "#FF6B8A" },
], []);

const styles = {
bigNum: { fontSize: "clamp(24px, 3.2vw, 48px)", fontWeight: 900 as const, color: "#fff", lineHeight: 1 },
name: { fontSize: "clamp(18px, 2.2vw, 28px)", fontWeight: 800 as const, color: "#fff", fontFamily: "Tajawal, sans-serif" },
small: { fontSize: "clamp(12px, 1.0vw, 14px)", color: "rgba(255,255,255,0.95)" },
};

const prevKeysRef = useRef<Record<string | number, string>>({});
const cardPop = useRef<Record<string | number, boolean>>({});
const [centerPop, setCenterPop] = useState<{ counterId: string | number; patient: Patient } | null>(null);

const voicesRef = useRef<SpeechSynthesisVoice[] | null>(null);
useEffect(() => {
const load = () => { voicesRef.current = window.speechSynthesis?.getVoices() || []; };
load();
window.speechSynthesis?.addEventListener?.("voiceschanged", load);
return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", load);
}, []);

const announcementQueue = useRef<Array<() => Promise<void>>>([]);
const processingRef = useRef(false);

const formatPrefixNumber = (p?: Patient) => (p ? `${p.prefix ?? ""}${p.number}` : "");

const enqueueAnnouncement = (counter: Counter, patient: Patient) => {
const job = async () => {
setCenterPop({ counterId: counter.id, patient });
cardPop.current[counter.id] = true;


  const text = `${patient.name} ${formatPrefixNumber(patient)} ${counter.name}`;
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = patient.lang === "en" ? "en-US" : "ar-SA";
    const voices = voicesRef.current ?? window.speechSynthesis.getVoices();
    const prefer = voices.find(v => (patient.lang === "en" ? v.lang.startsWith("en") : v.lang.startsWith("ar")));
    if (prefer) u.voice = prefer;

    await new Promise<void>((resolve) => {
      let done = false;
      u.onend = () => { if (!done) { done = true; resolve(); } };
      u.onerror = () => { if (!done) { done = true; resolve(); } };
      setTimeout(() => { if (!done) { done = true; resolve(); } }, 1600);
      window.speechSynthesis.speak(u);
    });
  } else {
    await new Promise(r => setTimeout(r, 1200));
  }

  cardPop.current[counter.id] = false;
  setCenterPop(null);
  await new Promise(r => setTimeout(r, 200));
};
announcementQueue.current.push(job);
processQueue();


};

const processQueue = async () => {
if (processingRef.current) return;
processingRef.current = true;
while (announcementQueue.current.length) {
const job = announcementQueue.current.shift()!;
try { await job(); } catch {}
}
processingRef.current = false;
};

useEffect(() => {
dataToRender.forEach(counter => {
const cur = counter.currentPatient ?? null;
const key = cur ? `${cur.prefix ?? ""}${cur.number}::${cur.name}` : "none";
const prev = prevKeysRef.current[counter.id];
if (prev === undefined) prevKeysRef.current[counter.id] = key;
else if (prev !== key) {
prevKeysRef.current[counter.id] = key;
if (cur) enqueueAnnouncement(counter, cur);
}
});
}, [dataToRender]);

return (
<Box sx={{ width: "100vw", height: "100vh", bgcolor: "#07182b", display: "flex", flexDirection: "column", overflow: "hidden", p: 1.5 }}>
{/* Fixed prayer */}
<Box sx={{ width: "100%", textAlign: "center", flex: "0 0 auto", py: 1 }}>
<Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "clamp(20px, 2.5vw, 32px)", textShadow: "0 2px 8px rgba(0,0,0,0.5)", letterSpacing: "0.6px", fontFamily: "Tajawal, sans-serif" }}>
اللهم رب الناس أذهب البأس واشف أنت الشافي </Typography> </Box>


  {/* Grid of counters */}
  <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "1rem", overflow: "hidden" }}>
    {dataToRender.map((counter, idx) => {
      const cur = counter.currentPatient ?? null;
      const pal = palette[idx % palette.length];

      return (
        <motion.div key={String(counter.id)} layout style={{ height: "100%" }}>
          <Paper component={motion.div} elevation={12} sx={{ height: "100%", display: "flex", flexDirection: "row", borderRadius: 2, overflow: "hidden", background: `linear-gradient(180deg, ${pal.from}, ${pal.to})` }}>
            {/* LEFT: Next patients */}
            <Box sx={{ width: "28%", minWidth: 160, background: "rgba(0,0,0,0.08)", p: 1.25, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "clamp(12px, 1vw, 14px)", mb: 0.6 }}>{cur?.lang === "ar" ? "القادمون" : "Next"}</Typography>
              <Box sx={{ flex: 1, overflow: "hidden", position: "relative" }}>
                <Box sx={{ position: "absolute", animation: `scrollUp ${Math.max(3,(counter.nextPatients?.length ?? 1))*3}s linear infinite`, top: 0 }}>
                  {(counter.nextPatients ?? []).map((np, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: "space-between", color: "#fff", fontFamily: "Tajawal, sans-serif", fontSize: "clamp(12px,1vw,14px)", py: 0.3 }}>
                      <span>{i + 1}</span>
                      <span>{np.prefix ?? ""}{np.number} - {np.name}</span>
                    </Box>
                  ))}
                </Box>
              </Box>
              <Typography sx={{ mt: "auto", pt: 0.5, color: "#ffffffcc", fontSize: "11px" }}>{counter.name}</Typography>
            </Box>

            {/* RIGHT: Current patient */}
            <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", justifyContent: "flex-start", position: "relative" }}>
              {cur && (
                <Box sx={{ position: "absolute", top: 12, right: 12, textAlign: "right" }}>
                  {/* BIG → Room Name */}
                  <Typography sx={styles.bigNum}>{counter.name}</Typography>
                  {/* SMALL → Prefix+Number */}
                  <Typography sx={styles.name}>{formatPrefixNumber(cur)}</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </motion.div>
      );
    })}
  </Box>

  {/* Center pop */}
  <AnimatePresence>
    {centerPop && (
      <motion.div key="center-pop" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.28 }} style={{ position: "fixed", left: "50%", top: "50%", transform: "translate(-50%,-50%)", zIndex: 1400, pointerEvents: "none" }}>
        <Paper elevation={30} sx={{ px: 5, py: 3, borderRadius: 2, background: "linear-gradient(180deg,#0b3240,#123f4f)", color: "#fff", minWidth: "min(720px, 82vw)", textAlign: "center", boxShadow: "0 40px 140px rgba(0,0,0,0.45)" }}>
          <Typography sx={{ fontSize: "clamp(22px,3.2vw,40px)", fontWeight: 900 }}>
            {counterNameFromId(centerPop.counterId)}
          </Typography>
          <Typography sx={{ fontSize: "clamp(18px,2.6vw,32px)", fontWeight: 900, mt: 0.4 }}>
            {formatPrefixNumber(centerPop.patient)}
          </Typography>
        </Paper>
      </motion.div>
    )}
  </AnimatePresence>

  <style>{`
    @keyframes scrollUp {
      0% { transform: translateY(100%); }
      100% { transform: translateY(-100%); }
    }
  `}</style>
</Box>


);

function counterNameFromId(id: string | number) {
return dataToRender.find(c => c.id === id)?.name ?? "";
}
}

function formatPrefixNumber(p?: Patient) { return p ? `${p.prefix ?? ""}${p.number}` : ""; }
