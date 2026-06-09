import React, { useRef, useState, useEffect } from 'react';
import { FiX, FiCamera, FiCheckCircle } from 'react-icons/fi';

export default function FaceScanner({ isOpen, onClose, onScan, title = "Yuz orqali tasdiqlash" }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
      setSuccess(false);
      setScanning(false);
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Kameraga ulanishda xatolik yuz berdi. Iltimos, ruxsat bering.");
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleScan = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setScanning(true);
    
    // Simulate a cool scanning effect duration
    setTimeout(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const base64Image = canvas.toDataURL('image/jpeg');
      
      setScanning(false);
      setSuccess(true);
      
      // Stop camera right after successful scan for better UX
      stopCamera();
      
      // Pass the scanned template after a short success animation
      setTimeout(() => {
        onScan(base64Image);
      }, 1000);
      
    }, 1500); // 1.5s scanning animation
  };

  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} className="face-scanner-modal">
        
        {/* Header */}
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={closeBtnStyle}><FiX size={24} /></button>
        </div>

        {/* Scanner Body */}
        <div style={bodyStyle}>
          {error ? (
            <div style={errorStyle}>{error}</div>
          ) : success ? (
            <div style={successStateStyle}>
              <FiCheckCircle size={64} color="#10B981" />
              <h3 style={{ marginTop: 16, color: '#10B981' }}>Muvaffaqiyatli!</h3>
            </div>
          ) : (
            <div style={scannerContainerStyle}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted
                style={videoStyle}
              />
              {/* Dynamic Scanning Overlay */}
              <div style={{...scanOverlayStyle, animation: scanning ? 'scan-anim 1.5s infinite linear' : 'none'}} />
              
              {/* Border Corners */}
              <div style={{...cornerStyle, top: 0, left: 0, borderTop: '4px solid #6C63FF', borderLeft: '4px solid #6C63FF'}} />
              <div style={{...cornerStyle, top: 0, right: 0, borderTop: '4px solid #6C63FF', borderRight: '4px solid #6C63FF'}} />
              <div style={{...cornerStyle, bottom: 0, left: 0, borderBottom: '4px solid #6C63FF', borderLeft: '4px solid #6C63FF'}} />
              <div style={{...cornerStyle, bottom: 0, right: 0, borderBottom: '4px solid #6C63FF', borderRight: '4px solid #6C63FF'}} />
            </div>
          )}
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Footer */}
        {!success && !error && (
          <div style={footerStyle}>
            <button 
              onClick={handleScan} 
              disabled={scanning || !stream}
              style={{...scanBtnStyle, opacity: (scanning || !stream) ? 0.7 : 1}}
            >
              {scanning ? (
                <><span className="spinner" style={{ marginRight: 8, width: 20, height: 20 }}></span> Skanerlanmoqda...</>
              ) : (
                <><FiCamera size={20} style={{ marginRight: 8 }} /> Yuzni skanerlash</>
              )}
            </button>
            <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
              Yuzingizni ramka ichiga to'liq kiriting va kameraga qarab turing.
            </p>
          </div>
        )}
      </div>

      {/* Inject animation styles if not present */}
      <style>{`
        @keyframes scan-anim {
          0% { top: 0%; opacity: 0.8; box-shadow: 0 0 15px 2px #6C63FF; }
          50% { top: 100%; opacity: 1; box-shadow: 0 0 20px 4px #6C63FF; }
          100% { top: 0%; opacity: 0.8; box-shadow: 0 0 15px 2px #6C63FF; }
        }
        .face-scanner-modal {
          animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

// ─── STYLES ───
const overlayStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 9999
};

const modalStyle = {
  background: '#ffffff', borderRadius: '24px', width: '90%', maxWidth: '420px',
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden',
  display: 'flex', flexDirection: 'column'
};

const headerStyle = {
  padding: '20px 24px', display: 'flex', justifyContent: 'space-between',
  alignItems: 'center', borderBottom: '1px solid #f0f0f0'
};

const closeBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', color: '#999',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4
};

const bodyStyle = {
  padding: '30px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center'
};

const scannerContainerStyle = {
  position: 'relative', width: '280px', height: '280px',
  borderRadius: '50%', overflow: 'hidden',
  boxShadow: '0 10px 30px rgba(108, 99, 255, 0.2)'
};

const videoStyle = {
  width: '100%', height: '100%', objectFit: 'cover',
  transform: 'scaleX(-1)' // Mirror effect
};

const scanOverlayStyle = {
  position: 'absolute', left: 0, right: 0, height: '4px',
  background: '#6C63FF', zIndex: 10
};

const cornerStyle = {
  position: 'absolute', width: '30px', height: '30px',
  borderRadius: '8px', zIndex: 5
};

const successStateStyle = {
  height: '280px', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center',
  animation: 'pop-in 0.5s ease-out forwards'
};

const errorStyle = {
  color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)',
  padding: '16px', borderRadius: '12px', textAlign: 'center',
  fontSize: '0.9rem', lineHeight: 1.5
};

const footerStyle = {
  padding: '0 24px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center'
};

const scanBtnStyle = {
  background: 'linear-gradient(135deg, #6C63FF 0%, #5a52d5 100%)',
  color: '#fff', border: 'none', borderRadius: '12px',
  padding: '16px 24px', width: '100%', fontSize: '1rem', fontWeight: 600,
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  boxShadow: '0 8px 20px rgba(108, 99, 255, 0.3)', transition: 'all 0.2s'
};
