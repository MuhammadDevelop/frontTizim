import { useState, useEffect } from 'react';
import { StudentAPI } from '../../api/client';
import FaceScanner from '../../components/FaceScanner';
import { FiCamera } from 'react-icons/fi';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('uz-UZ', {year:'numeric',month:'short',day:'numeric'}) : '—';
const statusMap = { present: {label:'Keldi', cls:'badge-success'}, absent: {label:'Kelmadi', cls:'badge-danger'}, late: {label:'Kech keldi', cls:'badge-warning'}, excused: {label:'Sababli', cls:'badge-info'} };

export default function AttendancePage() {
  const [records, setRecords] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupSelectModal, setGroupSelectModal] = useState(false);

  const fetchRecords = () => {
    StudentAPI.attendance().then(r => setRecords(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  };

  useEffect(() => {
    Promise.all([
      StudentAPI.attendance().then(r => setRecords(Array.isArray(r.data) ? r.data : [])),
      StudentAPI.myGroups().then(r => setGroups(Array.isArray(r.data) ? r.data : []))
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const openFaceAttendance = () => {
    if (groups.length === 1) {
      setSelectedGroupId(groups[0].id);
      setScannerOpen(true);
    } else if (groups.length > 1) {
      setGroupSelectModal(true);
    } else {
      alert("Siz bironta ham guruhga qo'shilmagansiz!");
    }
  };

  const startScannerWithGroup = (e) => {
    e.preventDefault();
    if (!selectedGroupId) return;
    setGroupSelectModal(false);
    setScannerOpen(true);
  };

  const handleScan = async (base64Image) => {
    try {
      const res = await StudentAPI.faceAttendance({
        group_id: Number(selectedGroupId),
        face_template: base64Image
      });
      alert(res.data.message || "Davomat muvaffaqiyatli tasdiqlandi!");
      setScannerOpen(false);
      fetchRecords(); // Refresh the list
    } catch (err) {
      alert("Xato: " + (err.response?.data?.detail || err.message));
      setScannerOpen(false);
    }
  };

  if (loading) return <div className="loading-overlay"><div className="spinner spinner-lg" /></div>;
  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h2>✅ Mening Davomatim</h2></div>
        <button className="btn btn-primary" onClick={openFaceAttendance} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCamera /> Face ID orqali tasdiqlash
        </button>
      </div>
      
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

      {groupSelectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', padding: '24px' }}>
            <h3>Guruhni tanlang</h3>
            <p className="text-muted text-sm mb-16">Qaysi guruh darsi uchun davomat qilyapsiz?</p>
            <form onSubmit={startScannerWithGroup}>
              <select className="form-control mb-16" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} required>
                <option value="">-- Guruhni tanlang --</option>
                {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setGroupSelectModal(false)}>Bekor qilish</button>
                <button type="submit" className="btn btn-primary" disabled={!selectedGroupId}>Davom etish</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <FaceScanner 
        isOpen={scannerOpen} 
        onClose={() => setScannerOpen(false)} 
        onScan={handleScan} 
      />
    </>
  );
}
