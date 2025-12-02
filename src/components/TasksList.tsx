import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Task {
  id: number;
  name: string;
  description: string;
  progress: number;
  required: number;
  rewardCoins: number;
  rewardExp: number;
  completed: boolean;
  claimed: boolean;
  isDaily: boolean;
}

interface TasksListProps {
  tasks: Task[];
  onClaim: (taskId: number) => void;
}

const TasksList = ({ tasks, onClaim }: TasksListProps) => {
  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const progressPercent = (task.progress / task.required) * 100;
        
        return (
          <Card 
            key={task.id} 
            className={`p-6 relative overflow-hidden transition-all hover:scale-[1.02] ${
              task.completed 
                ? 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30' 
                : 'bg-gradient-to-br from-muted/50 to-card'
            }`}
          >
            {task.completed && !task.claimed && (
              <div className="absolute top-0 right-0 text-6xl opacity-10 animate-pulse">
                ✨
              </div>
            )}

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg">{task.name}</h4>
                    {task.isDaily && (
                      <Badge variant="secondary" className="text-xs">
                        <Icon name="Clock" size={12} className="mr-1" />
                        Ежедневно
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>

                {task.completed && !task.claimed ? (
                  <Button 
                    onClick={() => onClaim(task.id)}
                    className="gradient-purple animate-pulse-glow"
                  >
                    <Icon name="Gift" size={16} className="mr-2" />
                    Забрать
                  </Button>
                ) : task.claimed ? (
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Icon name="Check" size={14} className="mr-1" />
                    Выполнено
                  </Badge>
                ) : null}
              </div>

              {!task.completed && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Прогресс</span>
                    <span>{task.progress} / {task.required}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              )}

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2 text-amber-400">
                  <span className="text-lg">🪙</span>
                  <span className="font-bold">+{task.rewardCoins}</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Icon name="Zap" size={16} />
                  <span className="font-bold">+{task.rewardExp} XP</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default TasksList;
