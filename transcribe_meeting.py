import os
import sys
import subprocess
import json
import speech_recognition as sr

scratch_dir = r"C:\Users\shri hari computer\.gemini\antigravity\brain\84f23ed8-58fe-4431-82c6-cc606978dd1d\scratch"
video_path = os.path.join(scratch_dir, "test18.mp4")
audio_path = os.path.join(scratch_dir, "meeting_audio.m4a")
frames_dir = os.path.join(scratch_dir, "frames")
os.makedirs(frames_dir, exist_ok=True)

# 1. Screenshots already extracted
print("Screenshots count:", len(os.listdir(frames_dir)))

# 2. Get total duration
duration = 21 * 60 + 56 # ~1316s
chunk_len = 30 # 30s chunks

r = sr.Recognizer()
transcript_file = os.path.join(scratch_dir, "meeting_transcript.txt")

with open(transcript_file, "w", encoding="utf-8") as out_f:
    out_f.write(f"=== MEETING AUDIO TRANSCRIPTION ===\n\n")

for start in range(0, duration, chunk_len):
    chunk_wav = os.path.join(scratch_dir, f"chunk_{start}.wav")
    
    # Extract 30s wav
    res = subprocess.run([
        "ffmpeg", "-ss", str(start), "-t", str(chunk_len),
        "-i", audio_path, "-ar", "16000", "-ac", "1",
        chunk_wav, "-y"
    ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    
    m, s = divmod(start, 60)
    time_str = f"[{m:02d}:{s:02d}]"
    
    text = ""
    try:
        with sr.AudioFile(chunk_wav) as src:
            audio = r.record(src)
            # Try Hindi first
            try:
                text = r.recognize_google(audio, language="hi-IN")
            except Exception:
                try:
                    text = r.recognize_google(audio, language="en-IN")
                except Exception:
                    text = ""
    except Exception as e:
        text = ""
    
    # Clean up chunk wav
    if os.path.exists(chunk_wav):
        os.remove(chunk_wav)
        
    line = f"{time_str} {text}\n"
    try:
        print(line.encode('ascii', errors='replace').decode('ascii'), end="")
    except Exception:
        pass
    sys.stdout.flush()
    with open(transcript_file, "a", encoding="utf-8") as out_f:
        out_f.write(line)

print("Transcription finished!")
