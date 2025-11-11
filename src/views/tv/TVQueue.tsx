import React, { useEffect, useRef, useState, useMemo } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

// Types
type Patient = { name: string; code?: string };
type Room = { name: string; currentPatient: Patient; nextPatients?: Patient[] };
type Clinic = { id: string; name: string; rooms: Room[] };

// Sample Data
const clinicsData: Clinic[] = [
  {
    id: "general",
    name: "General Clinic",
    rooms: [
      { name: "Room 1", currentPatient: { name: "Rahiq Al Hadhrami", code: "GM124" }, nextPatients: [{ name: "Fakhreya" }, { name: "Huda" }, { name: "Habib" }, { name: "Maryam" }] },
      { name: "Room 2", currentPatient: { name: "Mohammed Khalfan", code: "GM123" }, nextPatients: [{ name: "Khalfan" }, { name: "Khamis" }, { name: "Saeed" }] },
      { name: "Room 3", currentPatient: { name: "Aisha Saeed", code: "GM125" }, nextPatients: [{ name: "Ali" }, { name: "Sara" }] },
      { name: "Room 4", currentPatient: { name: "Huda Ahmed", code: "GM126" }, nextPatients: [{ name: "Fatima" }, { name: "Omar" }, { name: "Hassan" }] },
    ],
  },
  {
    id: "dental",
    name: "Dental Clinic",
    rooms: [
      { name: "Room 1", currentPatient: { name: "Fakhreya Omar", code: "D101" }, nextPatients: [{ name: "Hala" }, { name: "Mohammed" }, { name: "Sara" }] },
      { name: "Room 2", currentPatient: { name: "Abdulaziz Hamad", code: "D102" }, nextPatients: [{ name: "Ayman" }, { name: "Lina" }] },
      { name: "Room 3", currentPatient: { name: "Maryam Ali", code: "D103" }, nextPatients: [{ name: "Omar" }, { name: "Hassan" }] },
      { name: "Room 4", currentPatient: { name: "Huda Khalid", code: "D104" }, nextPatients: [{ name: "Fatima" }, { name: "Khalid" }] },
    ],
  },
];

// Main Component
export default function TVQueueScreen() {
  const [centerPop, setCenterPop] = useState<{ room: Room; clinicName: string } | null>(null);
  const announcementQueue = useRef<Array<() => Promise<void>>>([]);
  const processingRef = useRef(false);

  const voicesRef = useRef<SpeechSynthesisVoice[] | null>(null);
  useEffect(() => {
    const load = () => { voicesRef.current = window.speechSynthesis?.getVoices() || []; };
    load();
    window.speechSynthesis?.addEventListener?.("voiceschanged", load);
    return () => window.speechSynthesis?.removeEventListener?.("voiceschanged", load);
  }, []);

  const enqueueAnnouncement = (room: Room, clinicName: string) => {
    const job = async () => {
      setCenterPop({ room, clinicName });
      const text = `${room.currentPatient.name} ${room.currentPatient.code} ${clinicName}`;
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "ar-SA";
        const voices = voicesRef.current ?? window.speechSynthesis.getVoices();
        const prefer = voices.find(v => v.lang.startsWith("ar"));
        if (prefer) u.voice = prefer;

        await new Promise<void>((resolve) => {
          let done = false;
          u.onend = () => { if (!done) { done = true; resolve(); } };
          u.onerror = () => { if (!done) { done = true; resolve(); } };
          setTimeout(() => { if (!done) { done = true; resolve(); } }, 1800);
          window.speechSynthesis.speak(u);
        });
      } else await new Promise(r => setTimeout(r, 1200));
      setCenterPop(null);
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

  const palette = useMemo(() => [
    { from: "#083249", to: "#0b4f6c" },
    { from: "#3b2f63", to: "#4b3b8a" },
    { from: "#1b3a3a", to: "#1f6f6f" },
    { from: "#2f2b4f", to: "#40367a" },
  ], []);

  return (
    <Box sx={{ width: "100vw", height: "100vh", bgcolor: "#07182b", display: "flex", flexDirection: "column", overflow: "hidden", p: 1.5 }}>
      {/* Top Quran & Currently Called */}
      <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", py: 1 }}>
        {/* LEFT: Currently Called */}
        <AnimatePresence>
          {centerPop && (
            <motion.div key="center-pop" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.28 }}>
              <Paper elevation={30} sx={{ px: 5, py: 3, borderRadius: 2, background: "linear-gradient(180deg,#0b3240,#123f4f)", color: "#fff", textAlign: "center", minWidth: 350 }}>
                <Typography sx={{ fontSize: "clamp(22px,3.2vw,40px)", fontWeight: 900 }}>Currently Called</Typography>
                <Typography sx={{ fontSize: "clamp(18px,2.6vw,32px)", fontWeight: 900, mt: 0.4 }}>{centerPop.clinicName}</Typography>
                <Typography sx={{ fontSize: "clamp(18px,2.6vw,32px)", fontWeight: 900 }}>{centerPop.room.currentPatient.name} {centerPop.room.currentPatient.code}</Typography>
                <Typography sx={{ fontSize: "clamp(16px,2vw,28px)", fontWeight: 700, mt: 0.3 }}>{centerPop.room.name}</Typography>
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RIGHT: Quran */}
        <Box sx={{ flex: 1, textAlign: "right" }}>
          <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "clamp(20px, 2.5vw, 32px)", textShadow: "0 2px 8px rgba(0,0,0,0.5)", fontFamily: "Tajawal, sans-serif" }}>
            اللهم رب الناس أذهب البأس واشف أنت الشافي
          </Typography>
        </Box>
      </Box>

      {/* Grid of Clinics */}
      <Box sx={{ flex: 1, display: "grid", gridTemplateColumns: `repeat(2, 1fr)`, gap: "1rem", overflow: "hidden" }}>
        {clinicsData.map((clinic, idx) => {
          const pal = palette[idx % palette.length];
          return (
            <motion.div key={clinic.id} layout style={{ height: "100%" }}>
              <Paper
                component={motion.div}
                elevation={12}
                sx={{ height: "100%", display: "flex", flexDirection: "row", borderRadius: 2, overflow: "hidden", background: `linear-gradient(180deg, ${pal.from}, ${pal.to})` }}
              >
                {/* LEFT: Upcoming patients */}
                <Box sx={{ width: "35%", minWidth: 180, background: "rgba(0,0,0,0.08)", p: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <Typography sx={{ color: "#fff", fontWeight: 900, fontSize: "clamp(16px,2vw,28px)", mb: 1, textAlign: "center" }}>{clinic.name}</Typography>
                  {clinic.rooms.map((room, rIdx) => (
                    <Box key={rIdx} sx={{ mb: 0.8 }}>
                      <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: "clamp(14px,1.6vw,20px)" }}>{room.name}</Typography>
                      <Box sx={{ position: "relative", overflow: "hidden", height: 100 }}>
                        <Box sx={{ position: "absolute", animation: `scrollUp ${Math.max(4, room.nextPatients?.length ?? 1)*4}s linear infinite`, top: 0 }}>
                          {(room.nextPatients ?? []).map((np, i) => (
                            <Box key={i} sx={{ display: "flex", justifyContent: "space-between", color: "#fff", fontFamily: "Tajawal, sans-serif", fontSize: "clamp(14px,1.5vw,20px)", py: 0.5 }}>
                              <span>{i+1}</span>
                              <span>{np.name}</span>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>

                {/* RIGHT: Current patients */}
                <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", justifyContent: "flex-start", position: "relative" }}>
                  {clinic.rooms.map((room, rIdx) => (
                    <Box key={rIdx} sx={{ mb: 1, p: 1.5, borderRadius: 1, background: "rgba(255,255,255,0.1)", cursor: "pointer" }}
                      onClick={() => enqueueAnnouncement(room, clinic.name)}>
                      <Typography sx={{ fontWeight: 900, fontSize: "clamp(18px,2.2vw,28px)", color: "#fff" }}>{room.name}</Typography>
                      <Typography sx={{ fontWeight: 700, fontSize: "clamp(16px,2vw,24px)", color: "#fff" }}>{room.currentPatient.name} {room.currentPatient.code}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </motion.div>
          )
        })}
      </Box>

      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
      `}</style>
    </Box>
  )
}
