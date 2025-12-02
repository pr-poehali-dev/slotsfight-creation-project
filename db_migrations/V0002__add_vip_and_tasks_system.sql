ALTER TABLE players ADD COLUMN IF NOT EXISTS vip_level INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS vip_exp INTEGER DEFAULT 0;
ALTER TABLE players ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT NOT NULL,
    reward_coins INTEGER DEFAULT 0,
    reward_exp INTEGER DEFAULT 0,
    task_type VARCHAR(50) NOT NULL,
    required_count INTEGER DEFAULT 1,
    is_daily BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS player_tasks (
    id SERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL,
    task_id INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    claimed BOOLEAN DEFAULT FALSE,
    UNIQUE(player_id, task_id)
);

INSERT INTO tasks (task_name, task_description, reward_coins, reward_exp, task_type, required_count, is_daily) VALUES
('Первая игра дня', 'Сыграй в любую игру', 500, 10, 'daily_play', 1, true),
('Мастер колеса', 'Крути колесо удачи 5 раз', 1000, 25, 'wheel_spin', 5, false),
('Охотник за картами', 'Открой 10 скретч-карт', 2000, 50, 'scratch_card', 10, false),
('Везунчик дня', 'Выиграй 3 раза подряд', 1500, 30, 'win_streak', 3, true),
('Коллекционер монет', 'Собери 10000 монет', 5000, 100, 'collect_coins', 10000, false)
ON CONFLICT DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_player_tasks_player_id ON player_tasks(player_id);
CREATE INDEX IF NOT EXISTS idx_player_tasks_task_id ON player_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_players_score ON players(score DESC);
