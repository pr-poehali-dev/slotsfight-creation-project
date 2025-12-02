import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface VIPCardProps {
  level: number;
  exp: number;
  maxExp: number;
  bonus: number;
}

const VIPCard = ({ level, exp, maxExp, bonus }: VIPCardProps) => {
  const vipLevels = [
    { level: 0, name: 'Новичок', color: 'from-gray-500 to-gray-600', icon: '⭐' },
    { level: 1, name: 'Бронза', color: 'from-orange-600 to-orange-700', icon: '🥉' },
    { level: 2, name: 'Серебро', color: 'from-gray-400 to-gray-500', icon: '🥈' },
    { level: 3, name: 'Золото', color: 'from-yellow-500 to-yellow-600', icon: '🥇' },
    { level: 4, name: 'Платина', color: 'from-cyan-400 to-cyan-500', icon: '💎' },
    { level: 5, name: 'Легенда', color: 'from-purple-500 to-pink-500', icon: '👑' },
  ];

  const currentLevel = vipLevels.find(v => v.level === level) || vipLevels[0];
  const progress = (exp / maxExp) * 100;

  return (
    <Card className={`p-6 bg-gradient-to-br ${currentLevel.color} border-none relative overflow-hidden`}>
      <div className="absolute top-0 right-0 text-9xl opacity-10">
        {currentLevel.icon}
      </div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{currentLevel.icon}</div>
            <div>
              <h3 className="text-xl font-bold text-white">VIP {level}</h3>
              <p className="text-sm text-white/80">{currentLevel.name}</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            +{bonus}% бонус
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-white/90">
            <span>Прогресс до VIP {level + 1}</span>
            <span>{exp} / {maxExp} XP</span>
          </div>
          <Progress value={progress} className="h-3 bg-white/20" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-2 text-white/90">
            <Icon name="Sparkles" size={16} />
            <span className="text-sm">Уровень {level}</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <Icon name="TrendingUp" size={16} />
            <span className="text-sm">{progress.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default VIPCard;
