import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import TelegramAuth from '@/components/TelegramAuth';

interface TelegramUser {
  user_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  authenticated: boolean;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('main');
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [coins, setCoins] = useState(12450);
  const [rubies, setRubies] = useState(89);
  const [wheelSpinning, setWheelSpinning] = useState(false);
  const [scratchCards, setScratchCards] = useState([
    { id: 1, revealed: false, prize: 500 },
    { id: 2, revealed: false, prize: 1000 },
    { id: 3, revealed: false, prize: 250 },
  ]);

  const slots = [
    { id: 1, name: 'Diamond Rush', minBet: 10, image: '💎' },
    { id: 2, name: 'Lucky Seven', minBet: 50, image: '🍀' },
    { id: 3, name: 'Fire Wins', minBet: 100, image: '🔥' },
    { id: 4, name: 'Golden Crown', minBet: 25, image: '👑' },
    { id: 5, name: 'Magic Stars', minBet: 75, image: '⭐' },
    { id: 6, name: 'Treasure Hunt', minBet: 150, image: '🏆' },
  ];

  const achievements = [
    { id: 1, name: 'Первая победа', completed: true, progress: 100 },
    { id: 2, name: 'Мастер колеса', completed: true, progress: 100 },
    { id: 3, name: 'Коллекционер', completed: false, progress: 60 },
    { id: 4, name: 'Везунчик', completed: false, progress: 30 },
  ];

  const leaderboard = [
    { rank: 1, name: 'CryptoKing', score: 125400, avatar: 'CK' },
    { rank: 2, name: 'LuckyDice', score: 98750, avatar: 'LD' },
    { rank: 3, name: 'SlotMaster', score: 87320, avatar: 'SM' },
    { rank: 4, name: 'WinStreak', score: 76890, avatar: 'WS' },
    { rank: 5, name: 'DiamondHand', score: 65432, avatar: 'DH' },
  ];

  const spinWheel = () => {
    if (wheelSpinning || coins < 100) return;
    
    setWheelSpinning(true);
    setCoins(prev => prev - 100);
    
    setTimeout(() => {
      const prize = Math.floor(Math.random() * 1000) + 100;
      setCoins(prev => prev + prize);
      setWheelSpinning(false);
    }, 3000);
  };

  const revealScratchCard = (id: number) => {
    setScratchCards(prev =>
      prev.map(card =>
        card.id === id ? { ...card, revealed: true } : card
      )
    );
    const card = scratchCards.find(c => c.id === id);
    if (card && !card.revealed) {
      setTimeout(() => {
        setCoins(prev => prev + card.prize);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold gradient-purple bg-clip-text text-transparent">
                SlotsFight
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <Card className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/30">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🪙</span>
                      <span className="font-bold text-amber-400">{coins.toLocaleString()}</span>
                    </div>
                  </Card>
                  
                  <Card className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-600/20 border-red-500/30">
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

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-5 w-full max-w-3xl mx-auto bg-card">
            <TabsTrigger value="main" className="data-[state=active]:bg-primary">
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="slots" className="data-[state=active]:bg-primary">
              <Icon name="Sparkles" size={18} className="mr-2" />
              Слоты
            </TabsTrigger>
            <TabsTrigger value="wheel" className="data-[state=active]:bg-primary">
              <Icon name="Circle" size={18} className="mr-2" />
              Колесо
            </TabsTrigger>
            <TabsTrigger value="scratch" className="data-[state=active]:bg-primary">
              <Icon name="Ticket" size={18} className="mr-2" />
              Скретч
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-primary">
              <Icon name="Trophy" size={18} className="mr-2" />
              Рейтинг
            </TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-8 animate-fade-in">
            {!user ? (
              <Card className="max-w-2xl mx-auto p-12 text-center space-y-6 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
                <div className="space-y-4">
                  <div className="text-6xl">🎰</div>
                  <h1 className="text-4xl font-bold gradient-purple bg-clip-text text-transparent">
                    Добро пожаловать в SlotsFight
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Войди через Telegram, чтобы начать игру и сохранить свой прогресс
                  </p>
                </div>
                <div className="flex justify-center pt-4">
                  <TelegramAuth onAuth={(userData) => setUser(userData)} />
                </div>
                <div className="grid grid-cols-3 gap-4 pt-6">
                  <div className="space-y-2">
                    <div className="text-3xl">💎</div>
                    <p className="text-sm font-bold">Слоты</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl">🎡</div>
                    <p className="text-sm font-bold">Колесо</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl">🎟️</div>
                    <p className="text-sm font-bold">Скретч</p>
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <div className="text-center space-y-4">
                  <h1 className="text-5xl font-bold gradient-purple bg-clip-text text-transparent">
                    Добро пожаловать, {user.first_name}!
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Испытай удачу в увлекательных играх и выиграй крупный приз!
                  </p>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20" onClick={() => setActiveTab('slots')}>
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎰</div>
                  <h3 className="text-2xl font-bold">Слоты</h3>
                  <p className="text-muted-foreground">Крути барабаны и выигрывай</p>
                  <Button className="w-full gradient-purple">
                    Играть сейчас
                  </Button>
                </div>
              </Card>

              <Card className="p-6 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20" onClick={() => setActiveTab('wheel')}>
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎡</div>
                  <h3 className="text-2xl font-bold">Колесо удачи</h3>
                  <p className="text-muted-foreground">Испытай свою фортуну</p>
                  <Button className="w-full bg-secondary hover:bg-secondary/90">
                    Крутить колесо
                  </Button>
                </div>
              </Card>

              <Card className="p-6 hover:scale-105 transition-transform cursor-pointer bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20" onClick={() => setActiveTab('scratch')}>
                <div className="text-center space-y-4">
                  <div className="text-6xl">🎟️</div>
                  <h3 className="text-2xl font-bold">Скретч-карты</h3>
                  <p className="text-muted-foreground">Стирай и выигрывай</p>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Купить карту
                  </Button>
                </div>
              </Card>
            </div>

                <Card className="p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Реферальная программа</h3>
                      <p className="text-muted-foreground">Приглашай друзей и получай бонусы</p>
                    </div>
                    <Button size="lg" className="gradient-gold">
                      <Icon name="Share2" size={18} className="mr-2" />
                      Пригласить друга
                    </Button>
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="slots" className="animate-fade-in">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Игровые автоматы</h2>
                <p className="text-muted-foreground">Выбери свой любимый слот</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slots.map((slot) => (
                  <Card key={slot.id} className="overflow-hidden hover:scale-105 transition-all hover:shadow-xl hover:shadow-primary/20">
                    <div className="p-6 space-y-4">
                      <div className="text-center">
                        <div className="text-7xl mb-4">{slot.image}</div>
                        <h3 className="text-xl font-bold mb-2">{slot.name}</h3>
                        <Badge variant="secondary" className="mb-4">
                          Мин. ставка: {slot.minBet} 🪙
                        </Badge>
                      </div>
                      <Button className="w-full gradient-purple">
                        <Icon name="Play" size={18} className="mr-2" />
                        Играть
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wheel" className="animate-fade-in">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Колесо удачи</h2>
                <p className="text-muted-foreground">Крути колесо за 100 монет</p>
              </div>

              <Card className="p-8">
                <div className="flex flex-col items-center space-y-8">
                  <div className={`relative w-64 h-64 ${wheelSpinning ? 'animate-spin-wheel' : ''}`}>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent opacity-20"></div>
                    <div className="absolute inset-4 rounded-full border-8 border-primary/30 bg-card flex items-center justify-center">
                      <div className="text-6xl">🎯</div>
                    </div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-4xl">
                      ⬇️
                    </div>
                  </div>

                  <Button
                    size="lg"
                    onClick={spinWheel}
                    disabled={wheelSpinning || coins < 100}
                    className="w-full max-w-xs gradient-purple text-lg py-6"
                  >
                    {wheelSpinning ? 'Вращается...' : 'Крутить колесо (100 🪙)'}
                  </Button>

                  {coins < 100 && (
                    <p className="text-destructive text-sm">Недостаточно монет для вращения</p>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scratch" className="animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-2">Скретч-карты</h2>
                <p className="text-muted-foreground">Кликни на карту, чтобы узнать свой приз</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {scratchCards.map((card) => (
                  <Card
                    key={card.id}
                    className={`p-8 cursor-pointer transition-all ${
                      card.revealed
                        ? 'bg-gradient-to-br from-accent/20 to-accent/10'
                        : 'bg-gradient-to-br from-muted to-card hover:scale-105 hover:shadow-xl'
                    }`}
                    onClick={() => !card.revealed && revealScratchCard(card.id)}
                  >
                    <div className="text-center space-y-4">
                      {card.revealed ? (
                        <>
                          <div className="text-6xl">🎁</div>
                          <h3 className="text-2xl font-bold text-accent">
                            +{card.prize} 🪙
                          </h3>
                          <p className="text-muted-foreground">Поздравляем!</p>
                        </>
                      ) : (
                        <>
                          <div className="text-6xl">🎟️</div>
                          <h3 className="text-xl font-bold">Скретч-карта #{card.id}</h3>
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
                  className="gradient-gold"
                  disabled={coins < 300}
                >
                  <Icon name="Plus" size={18} className="mr-2" />
                  Купить новые карты (300 🪙)
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Достижения</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <Card key={achievement.id} className={`p-4 ${achievement.completed ? 'bg-primary/10 border-primary/30' : 'bg-muted/50'}`}>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">
                          {achievement.completed ? '🏆' : '🔒'}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold">{achievement.name}</h4>
                            <span className="text-sm text-muted-foreground">
                              {achievement.progress}%
                            </span>
                          </div>
                          <Progress value={achievement.progress} className="h-2" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Рейтинг игроков</h2>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    Сезон 1
                  </Badge>
                </div>
                <div className="space-y-3">
                  {leaderboard.map((player) => (
                    <Card key={player.rank} className={`p-4 ${player.rank <= 3 ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary/30' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold w-8 text-center">
                          {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                        </div>
                        <Avatar className="h-12 w-12 border-2 border-primary">
                          <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                            {player.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-bold">{player.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {player.score.toLocaleString()} очков
                          </p>
                        </div>
                        {player.rank <= 3 && (
                          <Badge variant="secondary" className="gradient-gold">
                            ТОП-{player.rank}
                          </Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;