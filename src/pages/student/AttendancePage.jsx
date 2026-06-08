import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import FaceIdScanner from '../../components/FaceIdScanner';
import { saveFaceData } from '../../utils/faceApi';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', {year:'numeric',month:'short',day:'numeric'}) : '—';
const statusMap = { present: {label:'Keldi', cls:'badge-success'}, absent: {label:'Kelmadi', cls:'badge-danger'}, late: {label:'Kech keldi', cls:'badge-warning'}, excused: {label:'Sababli', cls:'badge-info'} };

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const { user } = useAuth();
  
  // Check if face is already registered in local storage
  const [isFaceRegistered, setIsFaceRegistered] = useState(false);

  useEffect(() => {
    StudentAPI.attendance().then(r => setRecords(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
    
    // Check local storage for face data
    if (user?.name) {
      const data = JSON.parse(localStorage.getItem('face_id_data') || '{}');
      setIsFaceRegistered(!!data[user.name]);
    }
  }, [user]);

  const handleFaceDetected = ({ descriptor }) => {
    if (user?.name) {
      saveFaceData(user.name, descriptor);
      setIsFaceRegistered(true);
      setTimeout(() => setShowScanner(false), 2000);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h2>✅ Mening Davomatim</h2></div>
        <div>
          {isFaceRegistered ? (
            <span className="badge badge-success" style={{ padding: '8px 12px', fontSize: '14px' }}>✓ Face ID Sozlangan</span>
          ) : (
            <button className="btn btn-primary" onClick={() => setShowScanner(!showScanner)}>
              {showScanner ? 'Bekor qilish' : 'Face ID Sozlash'}
            </button>
          )}
        </div>
      </div>
      
      {showScanner && !isFaceRegistered && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3>Yuzingizni skaner qiling</h3>
            <p className="text-muted">Davomat belgilash uchun yuzingizni kameraga ko'rsating</p>
          </div>
          <div className="card-body">
            <FaceIdScanner mode="register" onFaceDetected={handleFaceDetected} />
          </div>
        </div>
      )}

      <div className="card">
        {!records.length ? <div className="empty-state"><div className="empty-state-icon">✅</div><h4>Davomat yozuvlari yo'q</h4></div> :
        <div className="table-wrapper"><table className="table">
          <thead><tr><th>#</th><th>Sana</th><th>Guruh</th><th>Holat</th></tr></thead>
          <tbody>{records.map((r,i) => {
            const s = statusMap[r.status] || {label:r.status, cls:'badge-muted'};
            return <tr key={r.id || i}><td>{i+1}</td><td>{fmtDate(r.date)}</td><td>{r.group_id}</td>
              <td><span className={`badge ${s.cls}`}>{s.label}</span></td></tr>;
          })}</tbody>
        </table></div>}
      </div>
    </>
  );
}
