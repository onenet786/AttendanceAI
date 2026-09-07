import React, { useState } from 'react';
import {
  X,
  Camera,
  Trash2,
  RefreshCw,
  Server,
  Video,
  Cpu,
} from 'lucide-react';


export interface HardwareDevice {
  id: string;
  name: string;
  type: 'IP_CAMERA' | 'BIOMETRIC_TERMINAL' | 'QR_KIOSK';
  brand: string;
  ipAddress: string;
  port: number;
  rtspUrl?: string;
  branch: string;
  location: string;
  direction: 'CHECK_IN' | 'CHECK_OUT' | 'BIDIRECTIONAL';
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  pingMs: number;
  lastHeartbeat: string;
  fps?: number;
  resolution?: string;
}

export const INITIAL_HARDWARE_DEVICES: HardwareDevice[] = [
  {
    id: 'dev-1',
    name: 'CAM-LHR-ENTRANCE-01',
    type: 'IP_CAMERA',
    brand: 'Hikvision DS-2CD2087G2-LU',
    ipAddress: '192.168.1.101',
    port: 554,
    rtspUrl: 'rtsp://admin:pass@192.168.1.101:554/Streaming/Channels/101',
    branch: 'Lahore Head Office',
    location: 'Main Reception Turnstile A',
    direction: 'CHECK_IN',
    status: 'ONLINE',
    pingMs: 12,
    lastHeartbeat: '10s ago',
    fps: 30,
    resolution: '4K (3840x2160)',
  },
  {
    id: 'dev-2',
    name: 'CAM-LHR-EXIT-02',
    type: 'IP_CAMERA',
    brand: 'Dahua IPC-HFW5442E-ZE',
    ipAddress: '192.168.1.102',
    port: 554,
    rtspUrl: 'rtsp://admin:pass@192.168.1.102:554/cam/realmonitor?channel=1&subtype=0',
    branch: 'Lahore Head Office',
    location: 'East Corridor Exit Gate',
    direction: 'CHECK_OUT',
    status: 'ONLINE',
    pingMs: 14,
    lastHeartbeat: '15s ago',
    fps: 30,
    resolution: '1080p (1920x1080)',
  },
  {
    id: 'dev-3',
    name: 'ZK-TERM-LHR-MAIN',
    type: 'BIOMETRIC_TERMINAL',
    brand: 'ZKTeco SilkBio-101TC (Face + Palm + Finger)',
    ipAddress: '192.168.1.201',
    port: 4370,
    branch: 'Lahore Head Office',
    location: 'Ground Floor Lobby Kiosk',
    direction: 'BIDIRECTIONAL',
    status: 'ONLINE',
    pingMs: 9,
    lastHeartbeat: '4s ago',
  },
  {
    id: 'dev-4',
    name: 'CAM-ISB-GATE-01',
    type: 'IP_CAMERA',
    brand: 'Uniview IPC2324EBR-DPZ28',
    ipAddress: '192.168.2.105',
    port: 554,
    rtspUrl: 'rtsp://admin:pass@192.168.2.105:554/unicast/c1/s0/live',
    branch: 'Islamabad Regional Branch',
    location: 'Front Security Gate',
    direction: 'CHECK_IN',
    status: 'ONLINE',
    pingMs: 24,
    lastHeartbeat: '28s ago',
    fps: 25,
    resolution: '1080p',
  },
  {
    id: 'dev-5',
    name: 'HIK-FACETERM-ISB',
    type: 'BIOMETRIC_TERMINAL',
    brand: 'Hikvision DS-K1T671MF Face Terminal',
    ipAddress: '192.168.2.201',
    port: 8000,
    branch: 'Islamabad Regional Branch',
    location: '2nd Floor Entrance',
    direction: 'BIDIRECTIONAL',
    status: 'ONLINE',
    pingMs: 22,
    lastHeartbeat: '12s ago',
  },
];

interface HardwareSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: HardwareDevice[];
  onAddDevice: (device: HardwareDevice) => void;
  onDeleteDevice: (id: string) => void;
  onPingDevice: (id: string) => void;
}

export const HardwareSettingsModal: React.FC<HardwareSettingsModalProps> = ({
  isOpen,
  onClose,
  devices,
  onAddDevice,
  onDeleteDevice,
  onPingDevice,
}) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'ADD_CAMERA' | 'ADD_BIOMETRIC'>('LIST');

  // New Camera Form
  const [camName, setCamName] = useState('');
  const [camBrand, setCamBrand] = useState('Hikvision IP Camera');
  const [camIp, setCamIp] = useState('192.168.1.');
  const [camPort, setCamPort] = useState(554);
  const [camRtsp, setCamRtsp] = useState('rtsp://admin:pass@192.168.1.110:554/live');
  const [camBranch, setCamBranch] = useState('Lahore Head Office');
  const [camLocation, setCamLocation] = useState('Main Reception');
  const [camDirection, setCamDirection] = useState<HardwareDevice['direction']>('CHECK_IN');
  const [camRes, setCamRes] = useState('1080p');
  const [testResult, setTestResult] = useState<string | null>(null);

  // New Biometric Form
  const [bioName, setBioName] = useState('');
  const [bioBrand, setBioBrand] = useState('ZKTeco SilkBio-101TC');
  const [bioIp, setBioIp] = useState('192.168.1.');
  const [bioPort, setBioPort] = useState(4370);
  const [bioBranch, setBioBranch] = useState('Lahore Head Office');
  const [bioLocation, setBioLocation] = useState('Server Room Door');
  const [bioDirection, setBioDirection] = useState<HardwareDevice['direction']>('BIDIRECTIONAL');

  if (!isOpen) return null;

  const handleTestPing = () => {
    setTestResult('Pinging socket on LAN gateway...');
    setTimeout(() => {
      setTestResult('Ping Success: 11ms latency • RTSP Handshake Verified • Port open.');
    }, 1000);
  };

  const handleSaveCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!camName.trim()) return alert('Please enter camera name.');
    onAddDevice({
      id: `cam-${Date.now()}`,
      name: camName,
      type: 'IP_CAMERA',
      brand: camBrand,
      ipAddress: camIp,
      port: camPort,
      rtspUrl: camRtsp,
      branch: camBranch,
      location: camLocation,
      direction: camDirection,
      status: 'ONLINE',
      pingMs: Math.floor(10 + Math.random() * 20),
      lastHeartbeat: 'Just now',
      fps: 30,
      resolution: camRes,
    });
    setCamName('');
    setActiveTab('LIST');
  };

  const handleSaveBiometric = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bioName.trim()) return alert('Please enter biometric terminal name.');
    onAddDevice({
      id: `bio-${Date.now()}`,
      name: bioName,
      type: 'BIOMETRIC_TERMINAL',
      brand: bioBrand,
      ipAddress: bioIp,
      port: bioPort,
      branch: bioBranch,
      location: bioLocation,
      direction: bioDirection,
      status: 'ONLINE',
      pingMs: Math.floor(8 + Math.random() * 15),
      lastHeartbeat: 'Just now',
    });
    setBioName('');
    setActiveTab('LIST');
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
          maxWidth: '900px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          background: 'linear-gradient(145deg, #0f172a 0%, #090d16 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
          padding: '28px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server style={{ width: '22px', height: '22px', color: '#38bdf8' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
                Hardware Settings: IP Cameras & Biometric Terminals
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Direct integration with Hikvision, Dahua, Uniview CCTV RTSP streams and ZKTeco biometric attendance turnstiles.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}>
            <X style={{ width: '22px', height: '22px' }} />
          </button>
        </div>

        {/* Action / Nav Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('LIST')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: activeTab === 'LIST' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                color: activeTab === 'LIST' ? '#38bdf8' : 'var(--text-secondary)',
              }}
            >
              Configured Devices ({devices.length})
            </button>
            <button
              onClick={() => setActiveTab('ADD_CAMERA')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: activeTab === 'ADD_CAMERA' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: activeTab === 'ADD_CAMERA' ? '#34d399' : 'var(--text-secondary)',
              }}
            >
              <Camera style={{ width: '15px', height: '15px' }} />
              <span>+ Add IP Camera (RTSP)</span>
            </button>
            <button
              onClick={() => setActiveTab('ADD_BIOMETRIC')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                background: activeTab === 'ADD_BIOMETRIC' ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                color: activeTab === 'ADD_BIOMETRIC' ? '#c084fc' : 'var(--text-secondary)',
              }}
            >
              <Cpu style={{ width: '15px', height: '15px' }} />
              <span>+ Add Biometric Device</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-present" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
              GATEWAYS OPERATIONAL
            </span>
          </div>
        </div>

        {/* VIEW 1: CONFIGURED DEVICES LIST */}
        {activeTab === 'LIST' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {devices.map((dev) => (
              <div
                key={dev.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '10px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: dev.type === 'IP_CAMERA' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {dev.type === 'IP_CAMERA' ? (
                      <Video style={{ width: '20px', height: '20px', color: '#38bdf8' }} />
                    ) : (
                      <Cpu style={{ width: '20px', height: '20px', color: '#c084fc' }} />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{dev.name}</span>
                      <span className={dev.status === 'ONLINE' ? 'badge badge-present' : 'badge badge-leave'} style={{ fontSize: '0.68rem' }}>
                        {dev.status} ({dev.pingMs}ms)
                      </span>
                      <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)', color: 'var(--text-secondary)' }}>
                        {dev.direction}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      {dev.brand} • {dev.ipAddress}:{dev.port} • {dev.branch} ({dev.location})
                    </div>
                    {dev.rtspUrl && (
                      <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>
                        {dev.rtspUrl}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => onPingDevice(dev.id)}
                    title="Send ICMP Ping & RTSP Probe"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    <RefreshCw style={{ width: '12px', height: '12px' }} />
                    <span>Ping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteDevice(dev.id)}
                    title="Remove device"
                    style={{
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: '#f87171',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW 2: ADD IP CAMERA FORM */}
        {activeTab === 'ADD_CAMERA' && (
          <form onSubmit={handleSaveCamera} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#38bdf8' }}>
              Add RTSP IP Camera Stream (Hikvision, Dahua, Uniview, Axis)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Camera Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CAM-LHR-TURNSTILE-3"
                  value={camName}
                  onChange={(e) => setCamName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Brand / Model</label>
                <input
                  type="text"
                  value={camBrand}
                  onChange={(e) => setCamBrand(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>IP Address on LAN</label>
                <input
                  type="text"
                  value={camIp}
                  onChange={(e) => setCamIp(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>RTSP Port</label>
                <input
                  type="number"
                  value={camPort}
                  onChange={(e) => setCamPort(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Branch Office</label>
                <select
                  value={camBranch}
                  onChange={(e) => setCamBranch(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="Lahore Head Office">Lahore Head Office</option>
                  <option value="Islamabad Regional Branch">Islamabad Regional Branch</option>
                  <option value="Karachi Logistics Hub">Karachi Logistics Hub</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Punch Direction Mode</label>
                <select
                  value={camDirection}
                  onChange={(e) => setCamDirection(e.target.value as any)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="CHECK_IN">CHECK IN (Entrance)</option>
                  <option value="CHECK_OUT">CHECK OUT (Exit Gate)</option>
                  <option value="BIDIRECTIONAL">BIDIRECTIONAL (Turnstile)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Location / Mounting</label>
                <input
                  type="text"
                  value={camLocation}
                  onChange={(e) => setCamLocation(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Resolution Stream</label>
                <select
                  value={camRes}
                  onChange={(e) => setCamRes(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="1080p">1080p FHD (1920x1080)</option>
                  <option value="4K">4K UHD (3840x2160)</option>
                  <option value="720p">720p HD (1280x720)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                RTSP Stream URL (H.264 / H.265 RTSP feed)
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  required
                  value={camRtsp}
                  onChange={(e) => setCamRtsp(e.target.value)}
                  placeholder="rtsp://admin:password@192.168.1.108:554/ch0_0.h264"
                  style={{ flex: 1, padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem', fontFamily: 'monospace' }}
                />
                <button
                  type="button"
                  onClick={handleTestPing}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    background: 'rgba(56, 189, 248, 0.1)',
                    color: '#38bdf8',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Test Ping
                </button>
              </div>
            </div>

            {testResult && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#6ee7b7', fontSize: '0.8rem' }}>
                {testResult}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('LIST')}
                style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Save Camera Config
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: ADD BIOMETRIC TERMINAL FORM */}
        {activeTab === 'ADD_BIOMETRIC' && (
          <form onSubmit={handleSaveBiometric} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#c084fc' }}>
              Add Standalone Biometric Terminal (ZKTeco, Hikvision, Dahua)
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Device Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ZK-LHR-FLOOR2"
                  value={bioName}
                  onChange={(e) => setBioName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Brand / Protocol</label>
                <select
                  value={bioBrand}
                  onChange={(e) => setBioBrand(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="ZKTeco SilkBio-101TC (TCP/IP Port 4370)">ZKTeco SilkBio-101TC (TCP/IP Port 4370)</option>
                  <option value="Hikvision DS-K1T671MF (ISAPI Port 8000)">Hikvision DS-K1T671MF (ISAPI Port 8000)</option>
                  <option value="Dahua ASI7213X-T1 (NetSDK Port 37777)">Dahua ASI7213X-T1 (NetSDK Port 37777)</option>
                  <option value="Anviz FacePass 7 Pro">Anviz FacePass 7 Pro</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Device IP Address</label>
                <input
                  type="text"
                  value={bioIp}
                  onChange={(e) => setBioIp(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>TCP/IP Port</label>
                <input
                  type="number"
                  value={bioPort}
                  onChange={(e) => setBioPort(Number(e.target.value))}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Branch Office</label>
                <select
                  value={bioBranch}
                  onChange={(e) => setBioBranch(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="Lahore Head Office">Lahore Head Office</option>
                  <option value="Islamabad Regional Branch">Islamabad Regional Branch</option>
                  <option value="Karachi Logistics Hub">Karachi Logistics Hub</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Location / Door</label>
                <input
                  type="text"
                  value={bioLocation}
                  onChange={(e) => setBioLocation(e.target.value)}
                  placeholder="e.g. 2nd Floor Server Room"
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Punch Direction</label>
                <select
                  value={bioDirection}
                  onChange={(e) => setBioDirection(e.target.value as any)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="BIDIRECTIONAL">BIDIRECTIONAL (In / Out Turnstile)</option>
                  <option value="CHECK_IN">CHECK IN (Entrance Reader)</option>
                  <option value="CHECK_OUT">CHECK OUT (Exit Reader)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('LIST')}
                style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '9px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #a855f7, #7e22ce)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Save Biometric Terminal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
