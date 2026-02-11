import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, onSnapshot, collection, addDoc, serverTimestamp, query, orderBy, limit } from 'firebase/firestore';
import './App.css';

function App() {
    const [clickCount, setClickCount] = useState(0);
    const [totalVisits, setTotalVisits] = useState(0);
    const [visitorLogs, setVisitorLogs] = useState([]);

    // 1. 방문자 데이터 기록 및 실시간 업데이트
    useEffect(() => {
        const statsRef = doc(db, "siteStats", "global");

        // 방문 횟수 증가 로직 (로컬스토리지로 중복 방문 체크 간단히 수행 가능)
        const recordVisit = async () => {
            const snap = await getDoc(statsRef);
            if (!snap.exists()) {
                await setDoc(statsRef, { totalVisits: 1, clickCount: 0 });
            } else {
                await updateDoc(statsRef, { totalVisits: increment(1) });
            }

            // 방문 로그 추가
            await addDoc(collection(db, "visitorLogs"), {
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent
            });
        };

        recordVisit();

        // 실시간 통계 구독
        const unsubStats = onSnapshot(statsRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setTotalVisits(data.totalVisits || 0);
                setClickCount(data.clickCount || 0);
            }
        });

        // 최근 방문 로그 구독 (최근 5건)
        const q = query(collection(db, "visitorLogs"), orderBy("timestamp", "desc"), limit(5));
        const unsubLogs = onSnapshot(q, (snapshot) => {
            const logs = snapshot.docs.map(doc => ({
                id: doc.id,
                time: doc.data().timestamp?.toDate().toLocaleString() || "방금 전"
            }));
            setVisitorLogs(logs);
        });

        return () => {
            unsubStats();
            unsubLogs();
        };
    }, []);

    // 2. 클릭 카운트 증가 기능
    const handleButtonClick = async () => {
        const statsRef = doc(db, "siteStats", "global");
        await updateDoc(statsRef, { clickCount: increment(1) });
    };

    return (
        <div className="container">
            <header className="hero">
                <h1>Welcome to Hello Page</h1>
                <p>파이어스토어 데이터베이스 실시간 연동 테스트</p>
            </header>

            <main className="content">
                <div className="card visitor-card">
                    <h3>📊 실시간 통계</h3>
                    <div className="stat-grid">
                        <div className="stat-item">
                            <span>총 방문 횟수</span>
                            <strong>{totalVisits.toLocaleString()}</strong>
                        </div>
                        <div className="stat-item">
                            <span>누적 클릭 수</span>
                            <strong>{clickCount.toLocaleString()}</strong>
                        </div>
                    </div>
                    <button className="primary-btn" onClick={handleButtonClick}>
                        클릭하여 숫자 올리기!
                    </button>
                </div>

                <div className="card log-card">
                    <h3>🕒 최근 방문 기록 (실시간)</h3>
                    <ul className="log-list">
                        {visitorLogs.map(log => (
                            <li key={log.id}>• {log.time} - 새로운 방문자가 확인되었습니다.</li>
                        ))}
                    </ul>
                </div>
            </main>

            <footer className="footer">
                <p>GitHub Repository: book</p>
            </footer>
        </div>
    );
}

export default App;
