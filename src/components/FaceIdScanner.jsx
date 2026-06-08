import { useEffect, useRef, useState } from 'react';
import { loadModels, getFaceDescriptor, getFaceMatcher } from '../utils/faceApi';

export default function FaceIdScanner({ onFaceDetected, mode = 'register', studentId = null }) {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Modellar yuklanmoqda...');
  const [error, setError] = useState(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    
    const init = async () => {
      try {
        setStatus('AI modellar yuklanmoqda...');
        const modelsLoaded = await loadModels();
        if (!modelsLoaded) throw new Error("Modellarni yuklashda xatolik");
        
        if (!isMounted) return;
        setStatus('Kamera ulanmoqda...');
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Kameraga ulanish ruxsat etilmadi. (HTTPS yoki localhost kerak)");
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(e => console.warn("Video play blocked:", e));
        }
        
        setLoading(false);
        setStatus(mode === 'register' ? 'Kameraga qarang...' : 'O\'quvchilarni skaner qiling...');
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Kameraga ulanishda xato');
          setLoading(false);
        }
      }
    };
    
    init();
    
    return () => {
      isMounted = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [mode]);

  const handleVideoPlay = () => {
    if (mode === 'register') {
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        const descriptor = await getFaceDescriptor(videoRef.current);
        if (descriptor) {
          clearInterval(intervalRef.current);
          setStatus('Yuz muvaffaqiyatli aniqlandi! Saqlanmoqda...');
          onFaceDetected({ descriptor, type: 'register' });
        }
      }, 1000);
    } else if (mode === 'scan') {
      const faceMatcher = getFaceMatcher();
      if (!faceMatcher) {
        setError("Bazada yuz ma'lumotlari topilmadi. Avval o'quvchilar ro'yxatdan o'tishi kerak.");
        return;
      }
      
      intervalRef.current = setInterval(async () => {
        if (!videoRef.current) return;
        const descriptor = await getFaceDescriptor(videoRef.current);
        if (descriptor) {
          const match = faceMatcher.findBestMatch(descriptor);
          // Only trigger if we have a confident match (distance < 0.45)
          if (match.label !== 'unknown' && match.distance < 0.45) {
            setStatus(`${match.label} aniqlandi! (${(100 - match.distance * 100).toFixed(0)}%)`);
            onFaceDetected({ studentId: match.label, type: 'scan' });
          } else {
            setStatus('Yuz aniqlanmadi (yoki bazada yo\'q)');
          }
        }
      }, 1500);
    }
  };

  return (
    <div className="face-scanner-container" style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#000' }}>
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', zIndex: 10 }}>
          <div className="spinner" style={{ marginBottom: '16px', borderColor: '#fff', borderTopColor: 'transparent' }} />
          <p>{status}</p>
        </div>
      )}
      
      {error ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#ff6b6b' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>⚠️</div>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onPlay={handleVideoPlay}
            style={{ width: '100%', height: 'auto', display: loading ? 'none' : 'block', transform: 'scaleX(-1)' }}
          />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '15px', background: 'rgba(0,0,0,0.6)', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
            {status}
          </div>
          {mode === 'scan' && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', border: '2px solid rgba(108,99,255,0.8)', borderRadius: '20px', boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)', pointerEvents: 'none' }} />
          )}
        </>
      )}
    </div>
  );
}
