import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import TelegramAuth from '@/components/TelegramAuth';
import LoadingScreen from '@/components/LoadingScreen';
import VIPCard from '@/components/VIPCard';
import TasksList from '@/components/TasksList';

interface TelegramUser {
  user_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  authenticated: boolean;
}

const PLAYER_API_URL = 'https://functions.poehali.dev/d0f79b6a-c03e-41aa-91d9-d79f1b07dc06';

const Index = () => {
  const [showLoading, setShowLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('main');
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [coins, setCoins] = useState(12450);
  const [rubies, setRubies] = useState(89);
  const [vipLevel, setVipLevel] = useState(0);
  const [vipExp, setVipExp] = useState(0);
  const [loading, setLoading] = useState(false);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [scratchCards, setScratchCards] = useState([
    { id: 1, revealed: false, prize: 500 },
    { id: 2, revealed: false, prize: 1000 },
    { id: 3, revealed: false, prize: 250 },
  ]);

  const [tasks, setTasks] = useState([
    { id: 1, name: 'Первая игра дня', description: 'Сыграй в любую игру', progress: 0, required: 1, rewardCoins: 500, rewardExp: 10, completed: false, claimed: false, isDaily: true },
    { id: 2, name: 'Мастер колеса', description: 'Крути колесо удачи 5 раз', progress: 0, required: 5, rewardCoins: 1000, rewardExp: 25, completed: false, claimed: false, isDaily: false },
    { id: 3, name: 'Охотник за картами', description: 'Открой 10 скретч-карт', progress: 0, required: 10, rewardCoins: 2000, rewardExp: 50, completed: false, claimed: false, isDaily: false },
    { id: 4, name: 'Коллекционер монет', description: 'Собери 10000 монет', progress: 0, required: 10000, rewardCoins: 5000, rewardExp: 100, completed: false, claimed: false, isDaily: false },
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'CryptoKing', score: 125400, avatar: 'CK', vipLevel: 5 },
    { rank: 2, name: 'LuckyDice', score: 98750, avatar: 'LD', vipLevel: 4 },
    { rank: 3, name: 'SlotMaster', score: 87320, avatar: 'SM', vipLevel: 3 },
  ]);

  const slots = [
    { id: 1, name: 'Diamond Rush', minBet: 10, image: '💎' },
    { id: 2, name: 'Lucky Seven', minBet: 50, image: '🍀' },
    { id: 3, name: 'Fire Wins', minBet: 100, image: '🔥' },
    { id: 4, name: 'Golden Crown', minBet: 25, image: '👑' },
    { id: 5, name: 'Magic Stars', minBet: 75, image: '⭐' },
    { id: 6, name: 'Treasure Hunt', minBet: 150, image: '🏆' },
  ];

  const getVIPBonus = () => {
    return vipLevel * 10;
  };

  const getVIPMaxExp = () => {
    return 100 + (vipLevel * 50);
  };

  const claimTask = (taskId: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.completed && !task.claimed) {
        const bonus = 1 + (getVIPBonus() / 100);
        const finalCoins = Math.floor(task.rewardCoins * bonus);
        
        setCoins(c => c + finalCoins);
        setVipExp(exp => {
          const newExp = exp + task.rewardExp;
          const maxExp = getVIPMaxExp();
          
          if (newExp >= maxExp) {
            setVipLevel(lvl => lvl + 1);
            return newExp - maxExp;
          }
          return newExp;
        });
        
        return { ...task, claimed: true };
      }
      return task;
    }));
  };

  const spinWheel = () => {
    if (wheelSpinning || coins < 100 || !user) return;
    
    setWheelSpinning(true);
    const newCoins = coins - 100;
    setCoins(newCoins);
    
    setTasks(prev => prev.map(task => {
      if (task.id === 2 && !task.completed) {
        const newProgress = task.progress + 1;
        return { 
          ...task, 
          progress: newProgress,
          completed: newProgress >= task.required 
        };
      }
      return task;
    }));
    
    setTimeout(() => {
      const basePrize = Math.floor(Math.random() * 1000) + 100;
      const bonus = 1 + (getVIPBonus() / 100);
      const prize = Math.floor(basePrize * bonus);
      const finalCoins = newCoins + prize;
      setCoins(finalCoins);
      setWheelSpinning(false);
    }, 3000);
  };

  const revealScratchCard = (id: number) => {
    if (!user) return;
    
    setScratchCards(prev =>
      prev.map(card =>
        card.id === id ? { ...card, revealed: true } : card
      )
    );
    const card = scratchCards.find(c => c.id === id);
    if (card && !card.revealed) {
      const bonus = 1 + (getVIPBonus() / 100);
      const prize = Math.floor(card.prize * bonus);
      
      setTimeout(() => {
        setCoins(c => c + prize);
        
        setTasks(prev => prev.map(task => {
          if (task.id === 3 && !task.completed) {
            const newProgress = task.progress + 1;
            return { 
              ...task, 
              progress: newProgress,
              completed: newProgress >= task.required 
            };
          }
          return task;
        }));
      }, 300);
    }
  };

  useEffect(() => {
    setTasks(prev => prev.map(task => {
      if (task.id === 4 && !task.completed) {
        return {
          ...task,
          progress: Math.min(coins, task.required),
          completed: coins >= task.required
        };
      }
      return task;
    }));
  }, [coins]);

  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold gradient-purple bg-clip-text text-transparent text-shadow-glow">
                SlotsFight
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <Card className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/30 shadow-lg shadow-amber-500/20">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🪙</span>
                      <span className="font-bold text-amber-400">{coins.toLocaleString()}</span>
                    </div>
                  </Card>
                  
                  <Card className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-600/20 border-red-500/30 shadow-lg shadow-red-500/20">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">💎</span>
                      <span className="font-bold text-red-400">{rubies}</span>
                    </div>
                  </Card>
                </>
              )}

              <TelegramAuth onAuth={(userData) => setUser(userData)} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-lg shadow-xl">
            <TabsTrigger value="main" className="data-[state=active]:bg-primary data-[state=active]:shadow-lg">
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="vip" className="data-[state=active]:bg-primary data-[state=active]:shadow-lg">
              <Icon name="Crown" size={18} className="mr-2" />
              VIP
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:shadow-lg">
              <Icon name="ListTodo" size={18} className="mr-2" />
              Задания
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-primary data-[state=active]:shadow-lg">
              <Icon name="Gamepad2" size={18} className="mr-2" />
              Игры
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-primary data-[state=active]:shadow-lg">
              <Icon name="Trophy" size={18} className="mr-2" />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:shadow-lg">
              <Icon name="User" size={18} className="mr-2" />
              Профиль
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-8 animate-fade-in">
            {!user ? (
              <Card className="max-w-3xl mx-auto p-16 text-center space-y-8 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 border-primary/30 shadow-2xl backdrop-blur-xl">
                <div className="space-y-6">
                  <div className="text-8xl animate-pulse">🎰</div>
                  <h1 className="text-6xl font-bold gradient-purple bg-clip-text text-transparent">
                    SlotsFight
                  </h1>
                  <p className="text-muted-foreground text-xl">
                    Войди, чтобы начать зарабатывать монеты!
                  </p>
                </div>
                <div className="flex justify-center pt-6">
                  <TelegramAuth onAuth={(userData) => setUser(userData)} />
                </div>
                <div className="grid grid-cols-3 gap-6 pt-8">
                  <div className="space-y-3 p-4 rounded-lg bg-card/30 backdrop-blur-sm">
                    <div className="text-4xl">💎</div>
                    <p className="text-sm font-bold">6 Слотов</p>
                  </div>
                  <div className="space-y-3 p-4 rounded-lg bg-card/30 backdrop-blur-sm">
                    <div className="text-4xl">👑</div>
                    <p className="text-sm font-bold">VIP Система</p>
                  </div>
                  <div className="space-y-3 p-4 rounded-lg bg-card/30 backdrop-blur-sm">
                    <div className="text-4xl">🎯</div>
                    <p className="text-sm font-bold">Задания</p>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <div className="text-center space-y-4 mb-8">
                  <h1 className="text-6xl font-bold gradient-purple bg-clip-text text-transparent animate-fade-in">
                    Добро пожаловать, {user.first_name}!
                  </h1>
                  <p className="text-muted-foreground text-xl">
                    Играй, выполняй задания и повышай свой VIP уровень!
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <VIPCard 
                    level={vipLevel} 
                    exp={vipExp} 
                    maxExp={getVIPMaxExp()} 
                    bonus={getVIPBonus()} 
                  />
                  
                  <Card className="p-6 bg-gradient-to-br from-card/50 to-muted/30 backdrop-blur-xl border-primary/20 shadow-xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Icon name="Zap" size={24} className="text-accent" />
                      Быстрый старт
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={() => setActiveTab('games')}
                        className="h-20 gradient-purple text-lg shadow-lg"
                      >
                        <Icon name="Play" size={20} className="mr-2" />
                        Играть
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('tasks')}
                        variant="outline"
                        className="h-20 text-lg border-primary/30"
                      >
                        <Icon name="ListTodo" size={20} className="mr-2" />
                        Задания
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {slots.slice(0, 3).map((slot) => (
                    <Card key={slot.id} className="group p-6 hover:scale-105 transition-all cursor-pointer bg-gradient-to-br from-card/50 to-muted/30 backdrop-blur-xl border-primary/20 hover:shadow-2xl hover:shadow-primary/20">
                      <div className="text-center space-y-4">
                        <div className="text-7xl group-hover:scale-110 transition-transform">{slot.image}</div>
                        <h3 className="text-xl font-bold">{slot.name}</h3>
                        <Badge variant="secondary" className="mb-4">
                          Мин. ставка: {slot.minBet} 🪙
                        </Badge>
                        <Button className="w-full gradient-purple shadow-lg">
                          <Icon name="Play" size={18} className="mr-2" />
                          Играть
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="vip" className="animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-bold gradient-purple bg-clip-text text-transparent">VIP Система</h2>
                <p className="text-muted-foreground text-lg">Повышай уровень и получай бонусы к выигрышам!</p>
              </div>

              <VIPCard 
                level={vipLevel} 
                exp={vipExp} 
                maxExp={getVIPMaxExp()} 
                bonus={getVIPBonus()} 
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[0, 1, 2, 3, 4, 5].map((level) => (
                  <Card key={level} className={`p-6 ${vipLevel >= level ? 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30' : 'bg-muted/30'}`}>
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">
                        {level === 0 ? '⭐' : level === 1 ? '🥉' : level === 2 ? '🥈' : level === 3 ? '🥇' : level === 4 ? '💎' : '👑'}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">VIP {level}</h4>
                        <p className="text-sm text-muted-foreground">+{level * 10}% к выигрышам</p>
                      </div>
                      {vipLevel >= level && (
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                          <Icon name="Check" size={14} className="mr-1" />
                          Открыто
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-5xl font-bold gradient-purple bg-clip-text text-transparent">Задания</h2>
                <p className="text-muted-foreground text-lg">Выполняй задания и получай монеты и опыт!</p>
              </div>

              <TasksList tasks={tasks} onClaim={claimTask} />
            </div>
          </TabsContent>

          <TabsContent value="games" className="animate-fade-in">
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-4xl font-bold mb-2">Слоты</h2>
                  <p className="text-muted-foreground">Выбери свой любимый слот</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {slots.map((slot) => (
                    <Card key={slot.id} className="group overflow-hidden hover:scale-105 transition-all hover:shadow-2xl hover:shadow-primary/20 bg-gradient-to-br from-card/50 to-muted/30 backdrop-blur-xl border-primary/20">
                      <div className="p-6 space-y-4">
                        <div className="text-center">
                          <div className="text-8xl mb-4 group-hover:scale-110 transition-transform">{slot.image}</div>
                          <h3 className="text-2xl font-bold mb-2">{slot.name}</h3>
                          <Badge variant="secondary" className="mb-4">
                            Мин. ставка: {slot.minBet} 🪙
                          </Badge>
                        </div>
                        <Button className="w-full gradient-purple text-lg py-6 shadow-lg" disabled={!user}>
                          <Icon name="Play" size={20} className="mr-2" />
                          Играть
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center">
                  <h2 className="text-4xl font-bold mb-2">Колесо удачи</h2>
                  <p className="text-muted-foreground">Крути колесо за 100 монет</p>
                </div>

                <Card className="p-12 bg-gradient-to-br from-card/50 to-muted/30 backdrop-blur-xl border-primary/20 shadow-2xl">
                  <div className="flex flex-col items-center space-y-8">
                    <div className={`relative w-80 h-80 ${wheelSpinning ? 'animate-spin-wheel' : ''}`}>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-30 shadow-2xl"></div>
                      <div className="absolute inset-6 rounded-full border-8 border-primary/50 bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-inner">
                        <div className="text-8xl">{wheelSpinning ? '🎯' : '🎰'}</div>
                      </div>
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 text-5xl animate-bounce">
                        ⬇️
                      </div>
                    </div>

                    {getVIPBonus() > 0 && (
                      <Badge variant="secondary" className="text-lg px-6 py-2 bg-gradient-to-r from-primary/20 to-secondary/20">
                        +{getVIPBonus()}% VIP бонус к выигрышу
                      </Badge>
                    )}

                    <Button
                      size="lg"
                      onClick={spinWheel}
                      disabled={wheelSpinning || coins < 100 || !user}
                      className="w-full max-w-md gradient-purple text-xl py-8 shadow-2xl shadow-primary/30"
                    >
                      {wheelSpinning ? 'Вращается...' : `Крутить колесо (100 🪙)`}
                    </Button>

                    {coins < 100 && user && (
                      <p className="text-destructive text-sm">Недостаточно монет для вращения</p>
                    )}
                  </div>
                </Card>
              </div>

              <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center">
                  <h2 className="text-4xl font-bold mb-2">Скретч-карты</h2>
                  <p className="text-muted-foreground">Кликни на карту, чтобы узнать свой приз</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {scratchCards.map((card) => (
                    <Card
                      key={card.id}
                      className={`p-10 cursor-pointer transition-all ${
                        card.revealed
                          ? 'bg-gradient-to-br from-accent/30 to-accent/20 border-accent/40'
                          : 'bg-gradient-to-br from-muted/30 to-card/50 hover:scale-105 hover:shadow-2xl backdrop-blur-xl'
                      }`}
                      onClick={() => !card.revealed && user && revealScratchCard(card.id)}
                    >
                      <div className="text-center space-y-6">
                        {card.revealed ? (
                          <>
                            <div className="text-8xl animate-scale-in">🎁</div>
                            <h3 className="text-3xl font-bold text-accent">
                              +{Math.floor(card.prize * (1 + getVIPBonus() / 100))} 🪙
                            </h3>
                            <p className="text-muted-foreground">Поздравляем!</p>
                          </>
                        ) : (
                          <>
                            <div className="text-8xl">🎟️</div>
                            <h3 className="text-2xl font-bold">Скретч #{card.id}</h3>
                            <p className="text-muted-foreground">Кликни, чтобы открыть</p>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={() => {
                      if (coins >= 300) {
                        setCoins(prev => prev - 300);
                        setScratchCards([
                          { id: Date.now(), revealed: false, prize: Math.floor(Math.random() * 1000) + 100 },
                          { id: Date.now() + 1, revealed: false, prize: Math.floor(Math.random() * 1000) + 100 },
                          { id: Date.now() + 2, revealed: false, prize: Math.floor(Math.random() * 1000) + 100 },
                        ]);
                      }
                    }}
                    className="gradient-gold text-xl px-12 py-6 shadow-2xl"
                    disabled={coins < 300 || !user}
                  >
                    <Icon name="Plus" size={20} className="mr-2" />
                    Купить новые карты (300 🪙)
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-5xl font-bold gradient-purple bg-clip-text text-transparent">Рейтинг игроков</h2>
                <Badge variant="secondary" className="text-xl px-6 py-3 shadow-lg">
                  Сезон 1
                </Badge>
              </div>
              <div className="space-y-4">
                {leaderboard.map((player) => (
                  <Card key={player.rank} className={`p-6 ${player.rank <= 3 ? 'bg-gradient-to-r from-primary/20 to-transparent border-primary/40 shadow-xl shadow-primary/20' : 'bg-card/50 backdrop-blur-xl'}`}>
                    <div className="flex items-center gap-6">
                      <div className="text-4xl font-bold w-16 text-center">
                        {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                      </div>
                      <Avatar className="h-16 w-16 border-4 border-primary shadow-lg">
                        <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                          {player.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl">{player.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{player.score.toLocaleString()} очков</span>
                          <Badge variant="secondary">VIP {player.vipLevel}</Badge>
                        </div>
                      </div>
                      {player.rank <= 3 && (
                        <Badge variant="secondary" className="gradient-gold text-lg px-4 py-2">
                          ТОП-{player.rank}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">
              <Card className="p-8 bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/30 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24 border-4 border-primary shadow-xl">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-3xl">
                      {user?.first_name.charAt(0) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold">{user?.first_name || 'Demo Player'}</h2>
                    <p className="text-muted-foreground text-lg">{user?.username && `@${user.username}`}</p>
                  </div>
                  <Badge variant="secondary" className="text-2xl px-6 py-3">
                    VIP {vipLevel}
                  </Badge>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30 shadow-xl">
                  <div className="text-center space-y-2">
                    <div className="text-5xl">🪙</div>
                    <p className="text-3xl font-bold text-amber-400">{coins.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Монет</p>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-red-500/20 to-pink-600/20 border-red-500/30 shadow-xl">
                  <div className="text-center space-y-2">
                    <div className="text-5xl">💎</div>
                    <p className="text-3xl font-bold text-red-400">{rubies}</p>
                    <p className="text-sm text-muted-foreground">Рубинов</p>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 border-blue-500/30 shadow-xl">
                  <div className="text-center space-y-2">
                    <div className="text-5xl">⚡</div>
                    <p className="text-3xl font-bold text-blue-400">{vipExp}</p>
                    <p className="text-sm text-muted-foreground">Опыта</p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
