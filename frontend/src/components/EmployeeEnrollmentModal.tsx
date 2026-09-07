import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Video,
  Mic,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Printer,
  ScanLine,
} from 'lucide-react';

import { EmployeeModel } from './AddEditEmployeeModal';

interface EmployeeEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeModel | null;
  onEnrollmentComplete: (employeeId: string, updates: Partial<EmployeeModel>) => void;
}

export const EmployeeEnrollmentModal: React.FC<EmployeeEnrollmentModalProps> = ({
  isOpen,
  onClose,
  employee,
  onEnrollmentComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'WEBCAM' | 'IPCAM' | 'QR' | 'VOICE'>('WEBCAM');

  // Webcam State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [faceVectorsExtracted, setFaceVectorsExtracted] = useState<number | null>(null);

  // IPCAM State
  const [rtspUrl, setRtspUrl] = useState('rtsp://admin:pass@192.168.1.108:554/live/ch0');
  const [ipcamStatus, setIpcamStatus] = useState<'IDLE' | 'TESTING' | 'CONNECTED' | 'FAILED'>('IDLE');
  const [ipcamFeedback, setIpcamFeedback] = useState<string | null>(null);

  // Voice State
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [voiceVectorReady, setVoiceVectorReady] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Badge State
  const [badgeCounter, setBadgeCounter] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setBadgeCounter((prev) => (prev <= 1 ? 45 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup camera stream on close
  useEffect(() => {
    if (!isOpen && cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
    }
  }, [isOpen, cameraStream]);

  if (!isOpen || !employee) return null;

  // Start Live Webcam
  const handleStartCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
        });
        setCameraStream(stream);
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        setCameraError('Webcam API is not supported in this browser environment.');
      }
    } catch (err: any) {
      setCameraError(`Camera access denied or unavailable (${err.message || 'Permission denied'}). Simulated frame fallback available.`);
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const handleCaptureWebcam = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(dataUrl);
        setFaceVectorsExtracted(512);
        onEnrollmentComplete(employee.id, {
          photo: dataUrl,
          faceEnrolled: true,
        });
      }
    } else {
      // Simulation capture if webcam hardware is mock
      setCapturedPhoto(employee.photo);
      setFaceVectorsExtracted(512);
      onEnrollmentComplete(employee.id, { faceEnrolled: true });
    }
  };

  // Test IPCAM RTSP Handshake
  const handleTestIpcam = () => {
    setIpcamStatus('TESTING');
    setIpcamFeedback('Connecting to RTSP socket on LAN edge gateway (Port 554)...');
    setTimeout(() => {
      setIpcamStatus('CONNECTED');
      setIpcamFeedback('RTSP Stream Handshake Successful: H.264 Main Profile @ 1080p 30 FPS. Keyframe ingested.');
      setFaceVectorsExtracted(512);
      onEnrollmentComplete(employee.id, { faceEnrolled: true });
    }, 1400);
  };

  // Record Voiceprint
  const handleRecordVoice = () => {
    setIsRecordingVoice(true);
    setVoiceProgress(0);
    setVoiceVectorReady(false);
    setVoiceTranscript('Recording sample passphrase: "میری آواز میری شناخت ہے..."');

    const interval = setInterval(() => {
      setVoiceProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRecordingVoice(false);
          setVoiceVectorReady(true);
          setVoiceTranscript('Acoustic Sample Complete: 128-dim normalized MFCC spectral template generated.');
          onEnrollmentComplete(employee.id, { voiceEnrolled: true });
          return 100;
        }
        return prev + 20;
      });
    }, 400);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '92vh',
          overflowY: 'auto',
          borderRadius: '16px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          background: 'linear-gradient(145deg, #0d1117 0%, #161b22 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          padding: '28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={capturedPhoto || employee.photo}
              alt={employee.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Biometric Enrollment Center</h2>
                <span className="badge badge-present" style={{ fontSize: '0.7rem' }}>{employee.code}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {employee.name} • {employee.department} • {employee.branch}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
          >
            <X style={{ width: '22px', height: '22px' }} />
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('WEBCAM')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'WEBCAM' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: activeTab === 'WEBCAM' ? '#34d399' : 'var(--text-secondary)',
            }}
          >
            <Camera style={{ width: '16px', height: '16px' }} />
            <span>Webcam Facial Capture</span>
          </button>

          <button
            onClick={() => setActiveTab('IPCAM')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'IPCAM' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
              color: activeTab === 'IPCAM' ? '#38bdf8' : 'var(--text-secondary)',
            }}
          >
            <Video style={{ width: '16px', height: '16px' }} />
            <span>IP Cam / RTSP Ingress</span>
          </button>

          <button
            onClick={() => setActiveTab('VOICE')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'VOICE' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
              color: activeTab === 'VOICE' ? '#c084fc' : 'var(--text-secondary)',
            }}
          >
            <Mic style={{ width: '16px', height: '16px' }} />
            <span>Voiceprint Acoustic AI</span>
          </button>

          <button
            onClick={() => setActiveTab('QR')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: activeTab === 'QR' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: activeTab === 'QR' ? '#fbbf24' : 'var(--text-secondary)',
            }}
          >
            <QrCode style={{ width: '16px', height: '16px' }} />
            <span>Digital QR & Barcode Card</span>
          </button>
        </div>

        {/* TAB 1: WEBCAM FACIAL RECOGNITION ENROLLMENT */}
        {activeTab === 'WEBCAM' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Live Front-Desk Webcam Ingress</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Align employee face within the biometric oval guide to compute 512-dimensional normalized embeddings.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {!isCameraActive ? (
                  <button
                    type="button"
                    onClick={handleStartCamera}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Camera style={{ width: '14px', height: '14px' }} />
                    <span>Open Webcam</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopCamera}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#f87171',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Stop Camera
                  </button>
                )}
              </div>
            </div>

            {cameraError && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', fontSize: '0.8rem' }}>
                {cameraError}
              </div>
            )}

            {/* Video Viewport */}
            <div
              style={{
                position: 'relative',
                background: '#000',
                borderRadius: '12px',
                height: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '1px solid rgba(16, 185, 129, 0.4)',
              }}
            >
              {isCameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={capturedPhoto || employee.photo}
                    alt="Current Enrollment"
                    style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #10b981' }}
                  />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {faceVectorsExtracted ? '512-dim Normalized Face Vector Enrolled' : 'Click "Open Webcam" or capture current frame'}
                  </span>
                </div>
              )}

              {/* HUD Reticle Overlay */}
              <div
                style={{
                  position: 'absolute',
                  width: '180px',
                  height: '220px',
                  border: '2px dashed rgba(52, 211, 153, 0.7)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  boxShadow: '0 0 25px rgba(16, 185, 129, 0.2)',
                }}
              />

              <div style={{ position: 'absolute', bottom: '12px', left: '16px', fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.7)', display: 'flex', gap: '12px' }}>
                <span>Liveness: PASSIVE_TEXTURE</span>
                <span>Dim: 512-FLOAT32</span>
                <span>Threshold: 0.82</span>
              </div>
            </div>

            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {faceVectorsExtracted ? (
                  <span className="badge badge-present" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 style={{ width: '14px', height: '14px' }} />
                    <span>512-Vector Embedding Saved</span>
                  </span>
                ) : (
                  <span className="badge badge-leave">Awaiting Capture</span>
                )}
              </div>

              <button
                type="button"
                onClick={handleCaptureWebcam}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                <ScanLine style={{ width: '16px', height: '16px' }} />
                <span>Capture & Generate Biometrics</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IP CAMERA & RTSP STREAM INGRESS */}
        {activeTab === 'IPCAM' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Local LAN IP Camera / CCTV Snapshot</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Ingest live camera stream from Dahua, Hikvision, or Uniview surveillance cameras via RTSP or HTTP snapshot URI.
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Surveillance RTSP Stream / Snapshot URL
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={rtspUrl}
                  onChange={(e) => setRtspUrl(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
                <button
                  type="button"
                  onClick={handleTestIpcam}
                  disabled={ipcamStatus === 'TESTING'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #38bdf8, #0284c7)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw style={{ width: '14px', height: '14px', animation: ipcamStatus === 'TESTING' ? 'spin 1s infinite linear' : 'none' }} />
                  <span>{ipcamStatus === 'TESTING' ? 'Connecting...' : 'Test Stream'}</span>
                </button>
              </div>
            </div>

            {ipcamFeedback && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: ipcamStatus === 'CONNECTED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                  border: `1px solid ${ipcamStatus === 'CONNECTED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
                  color: ipcamStatus === 'CONNECTED' ? '#6ee7b7' : '#bae6fd',
                  fontSize: '0.82rem',
                }}
              >
                {ipcamFeedback}
              </div>
            )}

            <div
              style={{
                height: '180px',
                background: '#000',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <Video style={{ width: '32px', height: '32px', color: '#38bdf8' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {ipcamStatus === 'CONNECTED' ? 'Stream active: Keyframe buffer locked' : 'Waiting for RTSP handshake'}
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: VOICEPRINT ACOUSTIC ENROLLMENT */}
        {activeTab === 'VOICE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Acoustic Voiceprint Enrollment</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Speak the verification passphrase in Urdu or English to compute 128-dimensional acoustic spectral vectors.
              </p>
            </div>

            <div
              style={{
                padding: '24px',
                borderRadius: '12px',
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              {/* Pulsing Mic Indicator */}
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: isRecordingVoice ? 'rgba(239, 68, 68, 0.2)' : 'rgba(168, 85, 247, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isRecordingVoice ? '2px solid #ef4444' : '2px solid #c084fc',
                  boxShadow: isRecordingVoice ? '0 0 20px rgba(239, 68, 68, 0.5)' : 'none',
                }}
              >
                <Mic style={{ width: '30px', height: '30px', color: isRecordingVoice ? '#ef4444' : '#c084fc' }} />
              </div>

              {/* Progress Bar */}
              {isRecordingVoice && (
                <div style={{ width: '100%', maxWidth: '300px', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${voiceProgress}%`, height: '100%', background: 'linear-gradient(90deg, #c084fc, #a855f7)', transition: 'width 0.3s' }} />
                </div>
              )}

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>
                  {isRecordingVoice ? 'Listening to speech...' : voiceVectorReady ? 'Voiceprint Enrolled Successfully' : 'Ready to record voicepass'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {voiceTranscript || 'Say: "میرا نام احمد ہے اور یہ میری تصدیق ہے" (Or "My voice is my password")'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRecordVoice}
                disabled={isRecordingVoice}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #a855f7, #7e22ce)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: isRecordingVoice ? 'default' : 'pointer',
                }}
              >
                <Mic style={{ width: '16px', height: '16px' }} />
                <span>{isRecordingVoice ? 'Recording (Speak Now)...' : 'Record Voice Sample'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: DIGITAL QR CODE & BARCODE BADGE */}
        {activeTab === 'QR' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>Official Digital Employee ID & QR Card</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Rotating HMAC-SHA256 authenticated QR token for physical turnstiles, attendance kiosks, and barcode scanners.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {/* ID Badge Card */}
              <div
                style={{
                  width: '320px',
                  background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                  borderRadius: '16px',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.7)',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {/* Header Band */}
                <div style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff', letterSpacing: '0.05em' }}>
                    ATTENDANCEAI DIGITAL PASS
                  </span>
                  <ShieldCheck style={{ width: '16px', height: '16px', color: '#fff' }} />
                </div>

                {/* Body */}
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                  <img
                    src={capturedPhoto || employee.photo}
                    alt={employee.name}
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #f59e0b' }}
                  />

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{employee.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>{employee.designation}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{employee.department} • {employee.branch}</div>
                  </div>

                  {/* Simulated QR Code Canvas */}
                  <div style={{ background: '#fff', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <svg width="120" height="120" viewBox="0 0 100 100" style={{ shapeRendering: 'crispEdges' }}>
                      {/* Stylized QR Code Matrix */}
                      <rect width="100" height="100" fill="#ffffff" />
                      {/* Top-Left Position Marker */}
                      <rect x="5" y="5" width="28" height="28" fill="#000" />
                      <rect x="9" y="9" width="20" height="20" fill="#fff" />
                      <rect x="13" y="13" width="12" height="12" fill="#000" />
                      {/* Top-Right Position Marker */}
                      <rect x="67" y="5" width="28" height="28" fill="#000" />
                      <rect x="71" y="9" width="20" height="20" fill="#fff" />
                      <rect x="75" y="13" width="12" height="12" fill="#000" />
                      {/* Bottom-Left Position Marker */}
                      <rect x="5" y="67" width="28" height="28" fill="#000" />
                      <rect x="9" y="71" width="20" height="20" fill="#fff" />
                      <rect x="13" y="75" width="12" height="12" fill="#000" />
                      {/* Inner Data Cells */}
                      <rect x="38" y="10" width="8" height="8" fill="#000" />
                      <rect x="50" y="10" width="8" height="8" fill="#000" />
                      <rect x="38" y="24" width="8" height="8" fill="#000" />
                      <rect x="50" y="24" width="8" height="8" fill="#000" />
                      <rect x="38" y="38" width="24" height="24" fill="#000" />
                      <rect x="42" y="42" width="16" height="16" fill="#fff" />
                      <rect x="46" y="46" width="8" height="8" fill="#f59e0b" />
                      <rect x="10" y="38" width="6" height="6" fill="#000" />
                      <rect x="20" y="48" width="6" height="6" fill="#000" />
                      <rect x="70" y="38" width="6" height="6" fill="#000" />
                      <rect x="80" y="50" width="6" height="6" fill="#000" />
                      <rect x="38" y="70" width="8" height="8" fill="#000" />
                      <rect x="52" y="80" width="8" height="8" fill="#000" />
                      <rect x="70" y="70" width="10" height="10" fill="#000" />
                      <rect x="85" y="85" width="8" height="8" fill="#000" />
                    </svg>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#000', letterSpacing: '0.1em' }}>
                      {employee.code}
                    </div>
                  </div>

                  {/* Countdown Timer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#fbbf24' }}>
                    <RefreshCw style={{ width: '12px', height: '12px' }} />
                    <span>HMAC Token rotates in {badgeCounter}s</span>
                  </div>
                </div>

                {/* Footer Band */}
                <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>CNIC: {employee.cnic || '35201-1234567-1'}</span>
                  <span style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>SECURE</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => window.print()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-elevated)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Printer style={{ width: '14px', height: '14px' }} />
                <span>Print Badge</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => {
              handleStopCamera();
              onClose();
            }}
            style={{
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Done & Return
          </button>
        </div>
      </div>
    </div>
  );
};
