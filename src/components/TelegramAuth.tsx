import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TelegramUser {
  user_id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  authenticated: boolean;
}

interface TelegramAuthProps {
  onAuth: (user: TelegramUser) => void;
}

const TelegramAuth = ({ onAuth }: TelegramAuthProps) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const telegramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('telegram_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      onAuth(userData);
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'slotsfight_demo_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    if (telegramRef.current && !user) {
      telegramRef.current.appendChild(script);
    }

    (window as any).onTelegramAuth = async (telegramData: any) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('https://functions.poehali.dev/2d53a68a-409f-4bc2-befc-bb40ba49046b', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(telegramData),
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const userData: TelegramUser = await response.json();
        setUser(userData);
        localStorage.setItem('telegram_user', JSON.stringify(userData));
        onAuth(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [onAuth, user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('telegram_user');
    window.location.reload();
  };

  if (user) {
    return (
      <Card className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/30">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border-2 border-blue-400">
            {user.photo_url ? (
              <AvatarImage src={user.photo_url} alt={user.first_name} />
            ) : (
              <AvatarFallback className="bg-blue-500 text-white text-xs">
                {user.first_name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-blue-100 truncate">
              {user.first_name} {user.last_name || ''}
            </p>
            {user.username && (
              <p className="text-xs text-blue-300 truncate">@{user.username}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-blue-500/20 h-8 w-8"
          >
            <Icon name="LogOut" size={16} />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon name="Loader2" size={16} className="animate-spin" />
          <span className="text-sm">Авторизация...</span>
        </div>
      )}
      
      {error && (
        <Card className="px-4 py-2 bg-destructive/20 border-destructive/30">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      )}
      
      <div ref={telegramRef} className="telegram-login-widget" />
    </div>
  );
};

export default TelegramAuth;
