import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Eye, RotateCcw, Trophy, Keyboard, Pause, Play } from 'lucide-react';
import './styles.css';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 9, y: 10 },
  { x: 8, y: 10 },
  { x: 7, y: 10 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const STEP_TIME = 135;
const FOG_RADIUS = 3;
const REVEAL_TIME = 28;
const POWERUP_CHANCE = 0.32;

const directions = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  W: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  S: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  A: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  D: { x: 1, y: 0 },
};

function sameCell(a, b) {
  return a && b && a.x === b.x && a.y === b.y;
}

function cellKey(cell) {
  return `${cell.x}-${cell.y}`;
}

function randomFreeCell(snake, food, powerUp) {
  const occupied = new Set(snake.map(cellKey));
  if (food) occupied.add(cellKey(food));
  if (powerUp) occupied.add(cellKey(powerUp));

  const free = [];
  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      const candidate = { x, y };
      if (!occupied.has(cellKey(candidate))) free.push(candidate);
    }
  }
  return free[Math.floor(Math.random() * free.length)];
}

function isOpposite(next, current) {
  return next.x + current.x === 0 && next.y + current.y === 0;
}

function loadBestScore() {
  const value = Number(localStorage.getItem('memory-fog-snake-best'));
  return Number.isFinite(value) ? value : 0;
}

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [nextDirection, setNextDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState(() => randomFreeCell(INITIAL_SNAKE));
  const [powerUp, setPowerUp] = useState(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(loadBestScore);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [revealTicks, setRevealTicks] = useState(0);
  const [stageView, setStageView] = useState('final');
  const directionRef = useRef(INITIAL_DIRECTION);
  const nextDirectionRef = useRef(INITIAL_DIRECTION);

  const head = snake[0];
  const revealActive = revealTicks > 0;

  function resetGame() {
    const starterSnake = [...INITIAL_SNAKE];
    setSnake(starterSnake);
    setDirection(INITIAL_DIRECTION);
    setNextDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    nextDirectionRef.current = INITIAL_DIRECTION;
    setFood(randomFreeCell(starterSnake));
    setPowerUp(null);
    setScore(0);
    setRunning(false);
    setGameOver(false);
    setRevealTicks(0);
  }

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === ' ') {
        event.preventDefault();
        if (!gameOver && stageView !== 'static') setRunning((value) => !value);
        return;
      }

      if (event.key === 'r' || event.key === 'R') {
        resetGame();
        return;
      }

      const chosen = directions[event.key];
      if (!chosen) return;
      event.preventDefault();

      if (stageView === 'static' || gameOver) return;
      const current = directionRef.current;
      if (!isOpposite(chosen, current)) {
        nextDirectionRef.current = chosen;
        setNextDirection(chosen);
        setRunning(true);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameOver, stageView]);

  useEffect(() => {
    if (!running || gameOver || stageView === 'static') return undefined;

    const timer = setInterval(() => {
      setSnake((currentSnake) => {
        const currentDirection = directionRef.current;
        const requestedDirection = nextDirectionRef.current;
        const moveDirection = isOpposite(requestedDirection, currentDirection)
          ? currentDirection
          : requestedDirection;

        directionRef.current = moveDirection;
        setDirection(moveDirection);

        const currentHead = currentSnake[0];
        const newHead = {
          x: currentHead.x + moveDirection.x,
          y: currentHead.y + moveDirection.y,
        };

        const hitsWall =
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE;

        const bodyToCheck = currentSnake.slice(0, -1);
        const hitsSelf = bodyToCheck.some((part) => sameCell(part, newHead));

        if (hitsWall || hitsSelf) {
          setGameOver(true);
          setRunning(false);
          return currentSnake;
        }

        const ateFood = sameCell(newHead, food);
        const atePowerUp = sameCell(newHead, powerUp);
        const nextSnake = [newHead, ...currentSnake];

        if (!ateFood) nextSnake.pop();

        if (ateFood) {
          setScore((previous) => {
            const nextScore = previous + 10;
            setBest((oldBest) => {
              const newBest = Math.max(oldBest, nextScore);
              localStorage.setItem('memory-fog-snake-best', String(newBest));
              return newBest;
            });
            return nextScore;
          });
          const nextFood = randomFreeCell(nextSnake, null, powerUp);
          setFood(nextFood);

          if (!powerUp && Math.random() < POWERUP_CHANCE) {
            setPowerUp(randomFreeCell(nextSnake, nextFood, null));
          }
        }

        if (atePowerUp) {
          setPowerUp(null);
          setRevealTicks(REVEAL_TIME);
        }

        return nextSnake;
      });

      setRevealTicks((ticks) => Math.max(0, ticks - 1));
    }, stageView === 'interaction' ? STEP_TIME + 75 : STEP_TIME);

    return () => clearInterval(timer);
  }, [running, gameOver, food, powerUp, stageView]);

  const cells = useMemo(() => {
    const snakeMap = new Map(snake.map((part, index) => [cellKey(part), index]));
    const list = [];
    for (let y = 0; y < GRID_SIZE; y += 1) {
      for (let x = 0; x < GRID_SIZE; x += 1) {
        const cell = { x, y };
        const key = cellKey(cell);
        const snakeIndex = snakeMap.get(key);
        const distance = Math.abs(x - head.x) + Math.abs(y - head.y);
        const visible = revealActive || distance <= FOG_RADIUS || stageView !== 'final';
        list.push({
          key,
          x,
          y,
          snakeIndex,
          isHead: snakeIndex === 0,
          isSnake: snakeIndex !== undefined,
          isFood: sameCell(cell, food),
          isPowerUp: sameCell(cell, powerUp),
          visible,
          distance,
        });
      }
    }
    return list;
  }, [snake, food, powerUp, head, revealActive, stageView]);

  const statusText = gameOver
    ? 'Game Over：按 R 重新開始'
    : running
      ? '遊戲進行中'
      : '按空白鍵開始 / 暫停';

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Evolved Snake</p>
          <h1>Memory Fog Snake</h1>
          <p className="subtitle">
            這不是普通貪食蛇。你只能看見蛇頭附近的區域，必須靠記憶判斷食物、蛇身與安全路線。
          </p>
        </div>
        <div className="hero-card">
          <Eye size={28} />
          <strong>核心玩法</strong>
          <span>迷霧限制視野，吃藍色道具可短暫看清全地圖。</span>
        </div>
      </section>

      <section className="layout">
        <aside className="panel">
          <div className="score-grid">
            <div className="score-card">
              <span>Score</span>
              <strong>{score}</strong>
            </div>
            <div className="score-card">
              <span>Best</span>
              <strong>{best}</strong>
            </div>
          </div>

          <div className="status-box">
            <Trophy size={20} />
            <div>
              <strong>{statusText}</strong>
              <p>{revealActive ? `全圖視野剩餘 ${revealTicks} 格` : '迷霧啟動中：請記住剛剛看過的位置。'}</p>
            </div>
          </div>

          <div className="buttons">
            <button onClick={() => !gameOver && setRunning((value) => !value)} disabled={stageView === 'static' || gameOver}>
              {running ? <Pause size={18} /> : <Play size={18} />}
              {running ? '暫停' : '開始'}
            </button>
            <button onClick={resetGame} className="secondary">
              <RotateCcw size={18} />
              重新開始
            </button>
          </div>

          <div className="control-box">
            <Keyboard size={20} />
            <div>
              <strong>操作方式</strong>
              <p>方向鍵 / WASD 控制方向，空白鍵開始或暫停，R 重新開始。</p>
            </div>
          </div>

          <div className="stage-box">
            <strong>三段式開發檢查</strong>
            <label>
              <input type="radio" name="stage" checked={stageView === 'static'} onChange={() => { resetGame(); setStageView('static'); }} />
              Step 1 靜態畫面
            </label>
            <label>
              <input type="radio" name="stage" checked={stageView === 'interaction'} onChange={() => { resetGame(); setStageView('interaction'); }} />
              Step 2 單一互動
            </label>
            <label>
              <input type="radio" name="stage" checked={stageView === 'final'} onChange={() => { resetGame(); setStageView('final'); }} />
              Step 3 完整規則
            </label>
          </div>
        </aside>

        <section className="game-wrap">
          <div className={`board ${revealActive ? 'revealed' : ''}`}>
            {cells.map((cell) => {
              const classes = ['cell'];
              if (!cell.visible) classes.push('fog');
              if (cell.visible && cell.isSnake) classes.push(cell.isHead ? 'head' : 'snake');
              if (cell.visible && cell.isFood) classes.push('food');
              if (cell.visible && cell.isPowerUp) classes.push('power');
              return <div className={classes.join(' ')} key={cell.key} />;
            })}
          </div>
          {gameOver && (
            <div className="overlay">
              <h2>Game Over</h2>
              <p>你的分數：{score}</p>
              <button onClick={resetGame}>再玩一次</button>
            </div>
          )}
        </section>
      </section>

      <section className="readme-preview">
        <h2>Design Concept</h2>
        <p>
          我的進化版 Snake 名稱是 Memory Fog Snake。這個版本改變了原版貪食蛇「玩家可以看見整張地圖」的玩法，加入迷霧視野限制。
          玩家只能看見蛇頭附近的一小塊範圍，距離太遠的食物、蛇身和牆壁都會被迷霧遮住。因此玩家不只要控制方向，還需要記住剛剛看過的位置，判斷下一步是否安全。
          我希望這個版本讓 Snake 從單純的反應遊戲，變成需要短期記憶、方向感和風險判斷的遊戲。
        </p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
