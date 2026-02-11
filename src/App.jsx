import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import './App.css';

function App() {
    const [hallOfFame, setHallOfFame] = useState([]);
    const [loading, setLoading] = useState(true);

    // 실시간 명예의 전당 데이터 구독
    useEffect(() => {
        const q = query(collection(db, "hallOfFame"), orderBy("timestamp", "desc"), limit(20));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const docs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setHallOfFame(docs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching Hall of Fame: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="container">
            <header className="hero">
                <h1>🏆 Boss Raid: Hall of Fame</h1>
                <p>전설적인 정복자들의 기록을 실시간으로 확인하세요</p>
            </header>

            <main className="content">
                <div className="card leader-card">
                    <h3>🎖️ 최신 명예의 전당 (Top 20)</h3>
                    {loading ? (
                        <div className="loading">데이터를 불러오는 중...</div>
                    ) : (
                        <div className="fame-list">
                            {hallOfFame.length > 0 ? (
                                hallOfFame.map((record, index) => (
                                    <div key={record.id} className="fame-item">
                                        <div className="fame-rank">#{index + 1}</div>
                                        <div className="fame-info">
                                            <div className="fame-goal">🎯 {record.goal}</div>
                                            <div className="fame-meta">
                                                <span className={`difficulty-tag ${record.difficulty}`}>
                                                    {record.difficulty === 'HARD' ? '🔥 어려움' : record.difficulty === 'MEDIUM' ? '⚔️ 보통' : '🍃 쉬움'}
                                                </span>
                                                <span className="fame-date">📅 {record.date} {record.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">아직 기록된 승리가 없습니다. 보스를 정복하고 첫 기록을 남겨보세요!</div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <footer className="footer">
                <p>Game Repository: <a href="https://github.com/hhyeoncheol389-bit/book2" target="_blank" rel="noreferrer">book2 (Boss Raid)</a></p>
                <p>© 2026 Boss Raid Project Hub</p>
            </footer>
        </div>
    );
}

export default App;
