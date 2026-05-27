import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const DEMO_TESTS = [
  {
    id: 1, subject: 'Matematika', title: 'Algebra asoslari', difficulty: 'easy',
    duration: 15, questionsCount: 10, status: 'available',
    questions: [
      { id: 1, text: '2 + 2 = ?', options: ['3', '4', '5', '6'], correct: 1 },
      { id: 2, text: '5 * 3 = ?', options: ['10', '12', '15', '18'], correct: 2 },
      { id: 3, text: 'sqrt(16) = ?', options: ['2', '3', '4', '8'], correct: 2 },
      { id: 4, text: '12 / 4 = ?', options: ['2', '3', '4', '6'], correct: 1 },
      { id: 5, text: '7 + 8 = ?', options: ['13', '14', '15', '16'], correct: 2 },
      { id: 6, text: '9^2 = ?', options: ['18', '72', '81', '90'], correct: 2 },
      { id: 7, text: '100 - 37 = ?', options: ['53', '63', '67', '73'], correct: 1 },
      { id: 8, text: '6 * 7 = ?', options: ['36', '42', '48', '54'], correct: 1 },
      { id: 9, text: '3^3 = ?', options: ['9', '18', '27', '81'], correct: 2 },
      { id: 10, text: '45 / 9 = ?', options: ['4', '5', '6', '7'], correct: 1 },
    ]
  },
  {
    id: 2, subject: 'English', title: 'Grammar — Tenses', difficulty: 'medium',
    duration: 20, questionsCount: 10, status: 'available',
    questions: [
      { id: 1, text: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'went'], correct: 1 },
      { id: 2, text: 'They ___ playing football now.', options: ['is', 'am', 'are', 'was'], correct: 2 },
      { id: 3, text: 'I ___ already finished.', options: ['has', 'have', 'had', 'having'], correct: 1 },
      { id: 4, text: 'He ___ a book yesterday.', options: ['read', 'reads', 'reading', 'readed'], correct: 0 },
      { id: 5, text: 'We ___ to London next year.', options: ['travel', 'will travel', 'traveled', 'traveling'], correct: 1 },
      { id: 6, text: 'The cat ___ on the mat.', options: ['sit', 'sits', 'sitted', 'siting'], correct: 1 },
      { id: 7, text: 'I ___ English for 5 years.', options: ['study', 'studied', 'have studied', 'studying'], correct: 2 },
      { id: 8, text: 'She ___ cooking when I arrived.', options: ['is', 'was', 'were', 'been'], correct: 1 },
      { id: 9, text: 'They ___ never been to Paris.', options: ['has', 'have', 'had', 'having'], correct: 1 },
      { id: 10, text: 'He ___ homework by 5pm.', options: ['finish', 'finishes', 'will finish', 'finished'], correct: 2 },
    ]
  },
  {
    id: 3, subject: 'Fizika', title: 'Mexanika', difficulty: 'hard',
    duration: 25, questionsCount: 10, status: 'available',
    questions: [
      { id: 1, text: 'Nyutonning 1-qonuni?', options: ['Tezlanish', 'Inersiya', 'Gravitatsiya', 'Energiya'], correct: 1 },
      { id: 2, text: 'F = m*a dagi "a"?', options: ['Massa', 'Kuch', 'Tezlanish', 'Tezlik'], correct: 2 },
      { id: 3, text: 'g = ? m/s2', options: ['8.9', '9.8', '10.2', '9.0'], correct: 1 },
      { id: 4, text: 'Ish birligi?', options: ['Nyuton', 'Joul', 'Vatt', 'Paskal'], correct: 1 },
      { id: 5, text: 'Quvvat birligi?', options: ['Joul', 'Nyuton', 'Vatt', 'Amper'], correct: 2 },
      { id: 6, text: '1 km/h = ? m/s', options: ['0.28', '0.36', '1.0', '3.6'], correct: 0 },
      { id: 7, text: 'Kinetik energiya?', options: ['mgh', '1/2 mv2', 'Fd', 'mc2'], correct: 1 },
      { id: 8, text: 'Bosim birligi?', options: ['Nyuton', 'Joul', 'Paskal', 'Vatt'], correct: 2 },
      { id: 9, text: 'v = ?', options: ['s*t', 's/t', 'F/m', 'm*a'], correct: 1 },
      { id: 10, text: 'Potensial energiya?', options: ['1/2 mv2', 'mgh', 'Fd', 'Pt'], correct: 1 },
    ]
  },
  {
    id: 4, subject: 'Matematika', title: 'Geometriya', difficulty: 'medium',
    duration: 20, questionsCount: 8, status: 'completed',
    score: 75, passingScore: 60, timeTaken: '14:32', completedAt: '2026-05-25', questions: []
  },
];

const DIFF_CLR = {
  easy: { bg: 'rgba(16,185,129,0.12)', c: '#10B981', bd: 'rgba(16,185,129,0.3)' },
  medium: { bg: 'rgba(245,158,11,0.12)', c: '#F59E0B', bd: 'rgba(245,158,11,0.3)' },
  hard: { bg: 'rgba(239,68,68,0.12)', c: '#EF4444', bd: 'rgba(239,68,68,0.3)' },
};

export default function TestsPage() {
  const { t } = useLanguage();
  const [tests] = useState(DEMO_TESTS);
  const [activeTest, setActiveTest] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [tab, setTab] = useState('available');
  const timerRef = useRef(null);

  const available = tests.filter(x => x.status === 'available');
  const completed = tests.filter(x => x.status === 'completed');

  useEffect(() => {
    if (activeTest && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(p => { if (p <= 1) { clearInterval(timerRef.current); return 0; } return p - 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [activeTest]);

  const startTest = (test) => {
    setActiveTest(test); setCurrentQ(0); setAnswers({}); setTimeLeft(test.duration * 60); setShowResult(null);
  };

  const handleFinish = useCallback(() => {
    clearInterval(timerRef.current);
    if (!activeTest) return;
    const qs = activeTest.questions;
    let correct = 0;
    qs.forEach((q, i) => { if (answers[i] === q.correct) correct++; });
    const score = Math.round((correct / qs.length) * 100);
    const elapsed = activeTest.duration * 60 - timeLeft;
    const m = Math.floor(elapsed / 60), s = elapsed % 60;
    setShowResult({ score, correct, total: qs.length, passingScore: 60, passed: score >= 60, timeTaken: `${m}:${String(s).padStart(2, '0')}` });
    setActiveTest(null);
  }, [activeTest, answers, timeLeft]);

  const fmtTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;

  // ── Result
  if (showResult) return (
    <div className="test-result-page">
      <div className="test-result-card">
        <div className={`result-icon ${showResult.passed ? 'passed' : 'failed'}`}>{showResult.passed ? '🎉' : '😔'}</div>
        <h2>{t('tests.results')}</h2>
        <p className="result-message">{showResult.passed ? t('tests.passed') : t('tests.failed')}</p>
        <div className="result-stats">
          <div className="result-stat-item">
            <div className="result-stat-circle" style={{ background: `conic-gradient(${showResult.passed ? '#10B981' : '#EF4444'} ${showResult.score * 3.6}deg, rgba(255,255,255,0.08) 0deg)` }}>
              <span>{showResult.score}%</span>
            </div>
            <div className="result-stat-label">{t('tests.yourScore')}</div>
          </div>
          <div className="result-details">
            <div className="result-detail-row"><span>✅ {t('tests.correctAnswers')}</span><span className="badge badge-success">{showResult.correct}/{showResult.total}</span></div>
            <div className="result-detail-row"><span>📊 {t('tests.passingScore')}</span><span className="badge badge-info">{showResult.passingScore}%</span></div>
            <div className="result-detail-row"><span>⏱ {t('tests.timeTaken')}</span><span className="badge badge-primary">{showResult.timeTaken}</span></div>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowResult(null)} style={{ marginTop: 24 }}>{t('tests.backToTests')}</button>
      </div>
    </div>
  );

  // ── Active Test
  if (activeTest) {
    const q = activeTest.questions[currentQ];
    const prog = ((currentQ + 1) / activeTest.questions.length) * 100;
    return (
      <div className="test-active-page">
        <div className="test-active-header">
          <div><h3>{activeTest.title}</h3><span className="text-muted text-sm">{currentQ + 1} / {activeTest.questions.length}</span></div>
          <div className={`test-timer ${timeLeft < 60 ? 'urgent' : ''}`}>⏱ {fmtTime(timeLeft)}</div>
        </div>
        <div className="test-progress-bar"><div className="test-progress-fill" style={{ width: `${prog}%` }} /></div>
        <div className="test-question-card">
          <div className="question-number">{currentQ + 1} / {activeTest.questions.length}</div>
          <h3 className="question-text">{q.text}</h3>
          <div className="options-grid">
            {q.options.map((opt, oi) => (
              <button key={oi} className={`option-btn ${answers[currentQ] === oi ? 'selected' : ''}`} onClick={() => setAnswers(p => ({ ...p, [currentQ]: oi }))}>
                <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="test-nav">
          <button className="btn btn-secondary" disabled={currentQ === 0} onClick={() => setCurrentQ(p => p - 1)}>← {t('app.back')}</button>
          <div className="question-dots">
            {activeTest.questions.map((_, i) => (
              <button key={i} className={`q-dot ${i === currentQ ? 'current' : ''} ${answers[i] !== undefined ? 'answered' : ''}`} onClick={() => setCurrentQ(i)}>{i + 1}</button>
            ))}
          </div>
          {currentQ < activeTest.questions.length - 1
            ? <button className="btn btn-primary" onClick={() => setCurrentQ(p => p + 1)}>{t('app.next')} →</button>
            : <button className="btn btn-success" onClick={handleFinish}>✓ {t('app.finish')}</button>}
        </div>
      </div>
    );
  }

  // ── List
  return (
    <>
      <div className="page-header"><div><h2>📋 {t('tests.title')}</h2></div></div>
      <div className="test-tabs">
        <button className={`test-tab ${tab === 'available' ? 'active' : ''}`} onClick={() => setTab('available')}>📝 {t('tests.available')} ({available.length})</button>
        <button className={`test-tab ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>✅ {t('tests.completed')} ({completed.length})</button>
      </div>
      {tab === 'available' && (
        <div className="tests-grid">
          {!available.length ? <div className="empty-state"><div className="empty-state-icon">📋</div><h4>{t('tests.noTests')}</h4></div>
          : available.map(test => {
            const d = DIFF_CLR[test.difficulty] || DIFF_CLR.medium;
            return (
              <div key={test.id} className="test-card">
                <div className="test-card-header">
                  <div className="test-subject-badge" style={{ background: d.bg, color: d.c, border: `1px solid ${d.bd}` }}>{test.subject}</div>
                  <span style={{ color: d.c, fontSize: '0.78rem', fontWeight: 600 }}>{t(`tests.${test.difficulty}`)}</span>
                </div>
                <h3 className="test-card-title">{test.title}</h3>
                <div className="test-card-meta"><span>📝 {test.questionsCount} {t('tests.questions')}</span><span>⏱ {test.duration} {t('tests.minutes')}</span></div>
                <button className="btn btn-primary btn-full" onClick={() => startTest(test)}>🚀 {t('tests.start')}</button>
              </div>
            );
          })}
        </div>
      )}
      {tab === 'completed' && (
        <div className="tests-grid">
          {!completed.length ? <div className="empty-state"><div className="empty-state-icon">✅</div><h4>{t('tests.noTests')}</h4></div>
          : completed.map(test => (
            <div key={test.id} className="test-card completed">
              <div className="test-card-header">
                <div className="test-subject-badge" style={{ background: 'rgba(108,99,255,0.12)', color: '#6C63FF', border: '1px solid rgba(108,99,255,0.3)' }}>{test.subject}</div>
                <span className={`badge ${test.score >= 60 ? 'badge-success' : 'badge-danger'}`}>{test.score}%</span>
              </div>
              <h3 className="test-card-title">{test.title}</h3>
              <div className="test-card-meta"><span>📊 {test.passingScore}%</span><span>⏱ {test.timeTaken}</span></div>
              <div className="test-score-bar"><div className={`test-score-fill ${test.score >= 60 ? 'pass' : 'fail'}`} style={{ width: `${test.score}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
