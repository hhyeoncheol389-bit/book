import React, { useState, useEffect } from 'react';
import './App.css';

const BOSS_TYPES = {
  EASY: { label: '그림자 하수인', hp: 50, color: '#4a4a4a', scale: 0.8, shadow: 'rgba(255,255,255,0.1)' },
  MEDIUM: { label: '강철의 수호자', hp: 150, color: '#39ff14', scale: 1.2, shadow: 'rgba(57,255,20,0.3)' },
  HARD: { label: '멸망의 군주', hp: 300, color: '#ff3131', scale: 1.8, shadow: 'rgba(255,49,49,0.5)' },
};

function App() {
  const [gameState, setGameState] = useState('START');
  const [goal, setGoal] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [actionInput, setActionInput] = useState("");
  const [boss, setBoss] = useState({ hp: 100, maxHp: 100, type: 'MEDIUM' });
  const [player, setPlayer] = useState({ hp: 100, maxHp: 100 });
  const [logs, setLogs] = useState([]);
  const [isDamaging, setIsDamaging] = useState(false);
  const [effect, setEffect] = useState(null); // 'HIT', 'MISS', 'CRITICAL'
  const [hallOfFame, setHallOfFame] = useState(() => {
    const saved = localStorage.getItem('bossHallOfFame');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('bossHallOfFame', JSON.stringify(hallOfFame));
  }, [hallOfFame]);

  const addLog = (msg, type = 'default') => {
    setLogs(prev => [{ msg, type }, ...prev].slice(0, 8));
  };

  const startBossBattle = (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    const type = BOSS_TYPES[difficulty];
    setBoss({ hp: type.hp, maxHp: type.hp, type: difficulty });
    setGameState('BATTLE');
    addLog(`목표 [${goal}]가 ${type.label}의 모습으로 실체화되었습니다!`, 'boss');
  };

  const attackBoss = (e) => {
    e.preventDefault();
    const action = actionInput.trim();
    if (!action || isDamaging) return;

    setIsDamaging(true);
    addLog(`나의 시도: "${action}"`, 'player');

    // 1. Relevance Check (Simplified logic using keywords)
    const goalWords = goal.toLowerCase().split(' ').filter(w => w.length > 1);
    const actionWords = action.toLowerCase().split(' ');

    // Check if at least one meaningful word from goal or related context is in action
    const isRelated = goalWords.some(gw => actionWords.some(aw => aw.includes(gw))) ||
      (action.length > goal.length * 0.8); // Length heuristic if keywords fail

    setTimeout(() => {
      if (!isRelated) {
        setEffect('MISS');
        addLog(`공격 실패! 목표와 관련 없는 행동은 보스에게 닿지 않습니다.`, 'warning');
        setTimeout(() => {
          setEffect(null);
          bossCounterAttack();
        }, 1000);
        setActionInput("");
        return;
      }

      // 2. Damage Calculation
      let damage = Math.floor(action.length * 2 + Math.random() * 20);
      const isCritical = action.length > 20;
      if (isCritical) {
        damage = Math.floor(damage * 1.5);
        setEffect('CRITICAL');
      } else {
        setEffect('HIT');
      }

      const newBossHp = Math.max(0, boss.hp - damage);
      setBoss(prev => ({ ...prev, hp: newBossHp }));
      addLog(`${isCritical ? '크리티컬! ' : ''}보스에게 ${damage}의 데미지를 입혔습니다!`, 'damage');

      setTimeout(() => {
        setEffect(null);
        if (newBossHp <= 0) {
          recordVictory();
          setGameState('VICTORY');
          setIsDamaging(false);
        } else {
          bossCounterAttack();
        }
      }, 1000);

      setActionInput("");
    }, 500);
  };

  const recordVictory = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    const record = { id: Date.now(), goal, difficulty, date: dateStr, time: timeStr };
    setHallOfFame(prev => [record, ...prev]);
  };

  const resetHallOfFame = () => {
    if (window.confirm("명예의 전당의 모든 기록을 삭제하시겠습니까?")) {
      setHallOfFame([]);
    }
  };

  const bossCounterAttack = () => {
    const counterDamage = Math.floor(Math.random() * (difficulty === 'HARD' ? 25 : 10));
    setPlayer(p => ({ ...p, hp: Math.max(0, p.hp - counterDamage) }));
    addLog(`보스의 반격! 체력 -${counterDamage}`, 'warning');
    setIsDamaging(false);
  };

  if (gameState === 'START') {
    return (
      <div className="start-screen panel">
        <h1 className="glitch-text">BOSS RAID</h1>
        <p>현실의 목표를 보스로 소환합니다. 오직 목표와 관련된 행동만이 보스를 밸 수 있습니다.</p>
        <form onSubmit={startBossBattle} className="start-form">
          <input
            type="text"
            placeholder="목표 입력 (예: 영어 공부 1시간)"
            value={goal}
            onChange={e => setGoal(e.target.value)}
            autoFocus
          />
          <div className="difficulty-selector">
            <span className="label">난이도:</span>
            {Object.keys(BOSS_TYPES).map(t => (
              <button
                key={t}
                type="button"
                className={difficulty === t ? 'active' : ''}
                onClick={() => setDifficulty(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <button type="submit" className="btn-start">전투 개시</button>
        </form>

        {hallOfFame.length > 0 && (
          <div className="hall-of-fame panel">
            <div className="fame-header">
              <h3>명예의 전당 (정복된 목표)</h3>
              <button className="btn-reset" onClick={resetHallOfFame}>기록 리셋</button>
            </div>
            <div className="fame-list">
              {hallOfFame.map(r => (
                <div key={r.id} className="fame-item">
                  <span className="fame-date">{r.date} {r.time}</span>
                  <span className="fame-goal">[{r.difficulty}] {r.goal}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (gameState === 'VICTORY') {
    return (
      <div className="result-screen success">
        <h2 className="victory-text">MISSION CLEARED</h2>
        <div className="victory-card panel">
          <p>웅장한 적 [${goal}]을(를) 물리치고 성취를 쟁취했습니다.</p>
          <p className="fame-confirm">명예의 전당에 기록되었습니다.</p>
          <button onClick={() => setGameState('START')}>다음 목표 소환</button>
        </div>
      </div>
    );
  }

  const currentBoss = BOSS_TYPES[boss.type];

  return (
    <div className="game-container">
      <div className="battle-header">
        <div className="boss-status">
          <h2 className="boss-title">{currentBoss.label}: {goal}</h2>
          <div className="hp-bar-outer boss-bar">
            <div className="hp-bar-inner" style={{ width: `${(boss.hp / boss.maxHp) * 100}%`, backgroundColor: currentBoss.color }}></div>
            <span className="hp-label">{boss.hp} / {boss.maxHp}</span>
          </div>
        </div>
      </div>

      <div className="battle-arena">
        <div className={`boss-vessel ${effect === 'HIT' || effect === 'CRITICAL' ? 'shake' : ''}`} style={{ transform: `scale(${currentBoss.scale})` }}>
          <div className="boss-pixel-art" style={{ borderColor: currentBoss.color, boxShadow: `0 0 40px ${currentBoss.shadow}` }}>
            <div className="boss-core" style={{ backgroundColor: currentBoss.color }}></div>
            <div className="boss-aura"></div>
          </div>
          {effect && <div className={`effect-text ${effect}`}>{effect}!</div>}
        </div>

        <div className="player-vessel">
          <div className="player-hp-mini">MY HP: {player.hp}</div>
          <div className="player-pixel-art"></div>
        </div>
      </div>

      <div className="battle-controls panel">
        <form onSubmit={attackBoss}>
          <div className="input-wrap">
            <input
              type="text"
              placeholder="목표와 관련된 행동을 입력하세요..."
              value={actionInput}
              onChange={e => setActionInput(e.target.value)}
              disabled={isDamaging}
            />
            <button type="submit" disabled={isDamaging || !actionInput.trim()}>EXECUTE</button>
          </div>
        </form>
        <div className="battle-log-window">
          {logs.map((log, i) => (
            <div key={i} className={`log-item ${log.type}`}>{`> ${log.msg}`}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
