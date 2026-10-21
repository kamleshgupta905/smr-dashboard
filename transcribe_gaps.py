import os
import subprocess
import speech_recognition as sr

scratch_dir = r"C:\Users\shri hari computer\.gemini\antigravity\brain\84f23ed8-58fe-4431-82c6-cc606978dd1d\scratch"
audio_path = os.path.join(scratch_dir, "meeting_audio.m4a")

# Target gaps: 03:00-06:00, 10:00-13:30, 14:30-18:30, 20:00-21:56
targets = [
    (3*60, 6*60),
    (10*60, 13*60 + 30),
    (14*60 + 30, 18*60 + 30),
    (20*60, 21*60 + 56)
]

r = sr.Recognizer()
r.energy_threshold = 150
r.dynamic_energy_threshold = True

gap_file = os.path.join(scratch_dir, "gaps_transcript.txt")
with open(gap_file, "w", encoding="utf-8") as out_f:
    out_f.write("=== GAPS TRANSCRIPT ===\n")

for start_range, end_range in targets:
    for t in range(start_range, end_range, 15):
        chunk_wav = os.path.join(scratch_dir, f"gap_{t}.wav")
        subprocess.run([
            "ffmpeg", "-ss", str(t), "-t", "15",
            "-i", audio_path, "-ar", "16000", "-ac", "1",
            chunk_wav, "-y"
        ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        m, s = divmod(t, 60)
        time_str = f"[{m:02d}:{s:02d}]"
        
        text = ""
        try:
            with sr.AudioFile(chunk_wav) as src:
                # adjust for ambient noise
                r.adjust_for_ambient_noise(src, duration=0.2)
                audio = r.record(src)
                try:
                    text = r.recognize_google(audio, language="hi-IN")
                except Exception:
                    try:
                        text = r.recognize_google(audio, language="en-IN")
                    except Exception:
                        pass
        except Exception:
            pass
            
        if os.path.exists(chunk_wav):
            os.remove(chunk_wav)
            
        if text:
            line = f"{time_str} {text}\n"
            with open(gap_file, "a", encoding="utf-8") as out_f:
                out_f.write(line)

print("Done gap transcription!")
