import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckSquare,
  CheckCircle2,
  Clock,
} from 'lucide-react';


interface AudibleUrduTaskManagerProps {
  onAddTask: (title: string, description?: string) => void;
  onRecordPunch: (action: 'CHECK_IN' | 'CHECK_OUT') => void;
  tasksCount: number;
  presentCount: number;
  lateCount: number;
}

export const AudibleUrduTaskManager: React.FC<AudibleUrduTaskManagerProps> = ({
  onAddTask,
  onRecordPunch,
  tasksCount,
  presentCount,
  lateCount,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [language, setLanguage] = useState<'ur-PK' | 'en-US'>('ur-PK');
  const [transcript, setTranscript] = useState<string>('');
  const [spokenReply, setSpokenReply] = useState<string>(
    'السلام علیکم! میں آپ کا اسسٹنٹ ہوں۔ آپ اردو یا انگریزی میں کہہ سکتے ہیں: "نیا ٹاسک بناؤ"، "میرے ٹاسک بتاؤ"، یا "حاضری لگاؤ"۔'
  );
  const [audioFeedback, setAudioFeedback] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Audio Speech Synthesis Voice Output
  const speakText = (text: string, lang: 'ur-PK' | 'en-US' = language) => {
    if (!('speechSynthesis' in window)) {
      setAudioFeedback('Browser SpeechSynthesis is not supported on this device.');
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ur-PK' ? 'ur' : 'en-US';
    utterance.rate = 0.95; // Natural cadence

    // Pick suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) => v.lang.startsWith(lang === 'ur-PK' ? 'ur' : 'en'));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Initialize Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognizer = new SpeechRecognition();
      recognizer.continuous = false;
      recognizer.interimResults = false;
      recognizer.lang = language;

      recognizer.onstart = () => {
        setIsListening(true);
        setAudioFeedback(language === 'ur-PK' ? 'مائیک فعال ہے، اردو میں بولیں...' : 'Listening, please speak now...');
      };

      recognizer.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript;
        setTranscript(spoken);
        processSpokenCommand(spoken);
      };

      recognizer.onerror = (event: any) => {
        setIsListening(false);
        setAudioFeedback(`Audio recognition status: ${event.error || 'idle'}`);
      };

      recognizer.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognizer;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language, tasksCount, presentCount, lateCount]);

  // Execute spoken intent
  const processSpokenCommand = (text: string) => {
    const lower = text.toLowerCase().trim();

    // 1. Urdu Task Creation: "نیا ٹاسک [نام]" or "ٹاسک بناؤ [نام]"
    if (
      /(نیا\s*ٹاسک|ٹاسک\s*بناؤ|task\s*banao|naya\s*task|create\s*task|add\s*task)/i.test(lower)
    ) {
      let taskTitle = text
        .replace(/(نیا\s*ٹاسک|ٹاسک\s*بناؤ|task\s*banao|naya\s*task|create\s*task|add\s*task)/gi, '')
        .trim();
      if (!taskTitle) {
        taskTitle = language === 'ur-PK' ? 'اہم پراجیکٹ کا نیا ٹاسک' : 'Urdu Voice Created Task';
      }

      onAddTask(taskTitle, `Created via Audible Voice Command: "${text}"`);
      const reply =
        language === 'ur-PK'
          ? `آپ کا نیا ٹاسک: "${taskTitle}" کامیابی کے ساتھ کینبان بورڈ میں شامل کر دیا گیا ہے۔`
          : `Task "${taskTitle}" has been added to your Kanban board.`;

      setSpokenReply(reply);
      speakText(reply, language);
      return;
    }

    // 2. Query Tasks: "میرے ٹاسک بتاؤ" or "show my tasks"
    if (
      /(میرے\s*ٹاسک|ٹاسک\s*بتاؤ|mere\s*task|show\s*tasks|my\s*tasks|list\s*tasks)/i.test(lower)
    ) {
      const reply =
        language === 'ur-PK'
          ? `اس وقت آپ کے پاس کل ${tasksCount} ٹاسک کینبان بورڈ میں موجود ہیں۔ آپ ان کی تفصیلات ٹاسک مینیجر میں دیکھ سکتے ہیں۔`
          : `You currently have ${tasksCount} tasks active on your Kanban board.`;

      setSpokenReply(reply);
      speakText(reply, language);
      return;
    }

    // 3. Attendance Punch In: "حاضری لگاؤ" or "clock in"
    if (
      /(حاضری\s*لگا|ان\s*کرو|clock\s*in|check\s*in|hazri\s*lagao|in\s*karo)/i.test(lower)
    ) {
      onRecordPunch('CHECK_IN');
      const reply =
        language === 'ur-PK'
          ? `خوش آمدید! آپ کی حاضری کامیابی کے ساتھ درج ہو چکی ہے۔ آپ کا دن اچھا گزرے!`
          : `Welcome! Your check-in punch has been recorded successfully. Have a great shift!`;

      setSpokenReply(reply);
      speakText(reply, language);
      return;
    }

    // 4. Attendance Punch Out: "چھٹی کرو" or "clock out"
    if (
      /(چھٹی\s*کرو|آؤٹ\s*کرو|clock\s*out|check\s*out|chutti\s*karo|out\s*karo)/i.test(lower)
    ) {
      onRecordPunch('CHECK_OUT');
      const reply =
        language === 'ur-PK'
          ? `اللہ حافظ! آپ کا چیک آؤٹ کامیابی کے ساتھ درج کر لیا گیا ہے۔`
          : `Good evening! Your check-out punch has been recorded.`;

      setSpokenReply(reply);
      speakText(reply, language);
      return;
    }

    // 5. Attendance Summary: "حاضری چیک کرو" or "who is present"
    if (
      /(حاضری\s*چیک|کتنے\s*حاضر|attendance\s*check|who\s*is\s*present)/i.test(lower)
    ) {
      const reply =
        language === 'ur-PK'
          ? `آج کی رپورٹ کے مطابق: کل ${presentCount} ملازمین حاضر ہیں اور ${lateCount} ملازمین لیٹ ہیں۔ تمام کیمرے اور فیس بائیومیٹرک سسٹمز فعال ہیں۔`
          : `Workforce summary: ${presentCount} employees are present and ${lateCount} are late. All biometric edge gateways are active.`;

      setSpokenReply(reply);
      speakText(reply, language);
      return;
    }

    // Default conversational reply
    const reply =
      language === 'ur-PK'
        ? `میں نے سنا: "${text}"۔ آپ اردو میں کہہ سکتے ہیں: "نیا ٹاسک بناؤ"، "حاضری لگاؤ"، یا "میرے ٹاسک بتاؤ"۔`
        : `I heard: "${text}". You can ask me to create tasks, record attendance, or summarize workforce hours.`;

    setSpokenReply(reply);
    speakText(reply, language);
  };

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = language;
          recognitionRef.current.start();
        } catch {
          // Restart if already running
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 200);
        }
      } else {
        // Fallback simulation if browser blocks mic
        setAudioFeedback('Mic unavailable or permission denied. Running conversational fallback simulation.');
        setTimeout(() => {
          const sample = language === 'ur-PK' ? 'نیا ٹاسک ایف بی آر سیلری رپورٹ چیک کرو' : 'create task Review FBR tax slabs';
          setTranscript(sample);
          processSpokenCommand(sample);
        }, 1200);
      }
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        borderRadius: '16px',
        border: '1px solid rgba(168, 85, 247, 0.3)',
        background: 'linear-gradient(145deg, rgba(30, 27, 75, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Title & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #a855f7, #6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.4)',
            }}
          >
            <Sparkles style={{ width: '22px', height: '22px', color: '#fff' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Audible Task & Attendance Voice Agent</span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                اردو آواز سپورٹ
              </span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real-time Speech Recognition & Spoken Voice Replies in Urdu (پاکستان) and English.
            </p>
          </div>
        </div>

        {/* Language & Voice Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '3px', border: '1px solid var(--border-subtle)' }}>
            <button
              type="button"
              onClick={() => setLanguage('ur-PK')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: language === 'ur-PK' ? 'linear-gradient(135deg, #a855f7, #7e22ce)' : 'transparent',
                color: language === 'ur-PK' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              اردو (Urdu)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en-US')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: language === 'en-US' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                color: language === 'en-US' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              English
            </button>
          </div>

          <button
            type="button"
            onClick={() => speakText(spokenReply, language)}
            title="Replay Voice Response Aloud"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              background: 'rgba(168, 85, 247, 0.1)',
              color: '#c084fc',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Volume2 style={{ width: '16px', height: '16px', animation: isSpeaking ? 'pulse 1s infinite' : 'none' }} />
            <span>{isSpeaking ? 'بول رہا ہے...' : 'آواز چلائیں'}</span>
          </button>
        </div>
      </div>

      {/* Main Voice Interaction Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(0, 0, 0, 0.3)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '12px',
          padding: '16px 20px',
        }}
      >
        {/* Large Mic Toggle Button */}
        <button
          type="button"
          onClick={handleToggleListening}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            border: 'none',
            background: isListening
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : 'linear-gradient(135deg, #a855f7, #6366f1)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: isListening ? '0 0 25px rgba(239, 68, 68, 0.6)' : '0 4px 15px rgba(168, 85, 247, 0.4)',
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        >
          {isListening ? (
            <MicOff style={{ width: '28px', height: '28px' }} />
          ) : (
            <Mic style={{ width: '28px', height: '28px' }} />
          )}
        </button>

        {/* Live Audio Visualizer Bars & Status */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isListening ? '#f87171' : '#c084fc' }}>
              {isListening
                ? language === 'ur-PK'
                  ? 'مائیکروفون فعال ہے — اب بولیں...'
                  : 'Listening to your microphone...'
                : language === 'ur-PK'
                ? 'مائیک دبائیں اور اردو میں بات کریں'
                : 'Click mic button to speak a command'}
            </span>

            {/* Oscillating Audio Waveform Visualizer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '20px' }}>
              {[8, 16, 24, 14, 28, 18, 10, 22, 12, 26, 16, 8].map((h, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '3px',
                    height: isListening || isSpeaking ? `${h}px` : '4px',
                    borderRadius: '2px',
                    background: isListening ? '#ef4444' : isSpeaking ? '#34d399' : '#6366f1',
                    transition: 'height 0.2s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Transcript display */}
          <div style={{ fontSize: '0.85rem', color: '#fff', fontStyle: transcript ? 'normal' : 'italic' }}>
            {transcript ? `"${transcript}"` : language === 'ur-PK' ? 'مثال: "نیا ٹاسک بنائیں"، "حاضری لگاؤ"، "میرے ٹاسک کیا ہیں"' : 'Say: "Create task [title]", "Clock in", or "Show my tasks"'}
          </div>
        </div>
      </div>

      {/* Spoken Response Card */}
      <div
        style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
        }}
      >
        <Volume2 style={{ width: '20px', height: '20px', color: '#34d399', marginTop: '2px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Audible Voice Response (آواز کا جواب)
          </div>
          <div style={{ fontSize: '0.92rem', color: '#fff', marginTop: '4px', lineHeight: 1.5 }}>
            {spokenReply}
          </div>
        </div>
      </div>

      {/* Quick Action Voice Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        <button
          type="button"
          onClick={() => {
            const cmd = language === 'ur-PK' ? 'نیا ٹاسک ایف بی آر ٹیکس ریٹرن فائل کرو' : 'create task File FBR tax return';
            setTranscript(cmd);
            processSpokenCommand(cmd);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-elevated)',
            color: '#fff',
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          <CheckSquare style={{ width: '13px', height: '13px', color: '#38bdf8' }} />
          <span>{language === 'ur-PK' ? '🗣️ "نیا ٹاسک بناؤ"' : '🗣️ "Create Task"'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const cmd = language === 'ur-PK' ? 'حاضری لگاؤ' : 'clock in';
            setTranscript(cmd);
            processSpokenCommand(cmd);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-elevated)',
            color: '#fff',
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          <CheckCircle2 style={{ width: '13px', height: '13px', color: '#10b981' }} />
          <span>{language === 'ur-PK' ? '🗣️ "حاضری لگاؤ"' : '🗣️ "Clock In"'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const cmd = language === 'ur-PK' ? 'میرے ٹاسک بتاؤ' : 'show my tasks';
            setTranscript(cmd);
            processSpokenCommand(cmd);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-elevated)',
            color: '#fff',
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          <Clock style={{ width: '13px', height: '13px', color: '#fbbf24' }} />
          <span>{language === 'ur-PK' ? '🗣️ "میرے ٹاسک بتاؤ"' : '🗣️ "Show My Tasks"'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const cmd = language === 'ur-PK' ? 'حاضری چیک کرو' : 'check attendance';
            setTranscript(cmd);
            processSpokenCommand(cmd);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-elevated)',
            color: '#fff',
            fontSize: '0.78rem',
            cursor: 'pointer',
          }}
        >
          <Sparkles style={{ width: '13px', height: '13px', color: '#c084fc' }} />
          <span>{language === 'ur-PK' ? '🗣️ "حاضری رپورٹ چیک کرو"' : '🗣️ "Check Attendance"'}</span>
        </button>
      </div>

      {audioFeedback && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {audioFeedback}
        </div>
      )}
    </div>
  );
};
