import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, Server, User, Lock } from 'lucide-react';
import { mt5Auth, MT5AuthCredentials } from '@/lib/mt5/auth';

interface MT5LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (accountInfo: any) => void;
}

export function MT5LoginDialog({ open, onOpenChange, onSuccess }: MT5LoginDialogProps) {
  const [credentials, setCredentials] = useState<MT5AuthCredentials>({
    server: '',
    login: 0,
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!credentials.server || !credentials.login || !credentials.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await mt5Auth.authenticate(credentials);
      
      if (result.success && result.accountInfo) {
        onSuccess(result.accountInfo);
        onOpenChange(false);
        // Reset form
        setCredentials({ server: '', login: 0, password: '' });
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setCredentials({
      server: 'MetaQuotes-Demo',
      login: 12345678,
      password: 'demo123'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Connect to MetaTrader 5
          </DialogTitle>
          <DialogDescription>
            Enter your MT5 account credentials to connect your trading account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="server" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Server
            </Label>
            <Input
              id="server"
              placeholder="e.g. MetaQuotes-Demo"
              value={credentials.server}
              onChange={(e) => setCredentials(prev => ({ ...prev, server: e.target.value }))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="login" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Login
            </Label>
            <Input
              id="login"
              type="number"
              placeholder="Your MT5 login number"
              value={credentials.login || ''}
              onChange={(e) => setCredentials(prev => ({ ...prev, login: parseInt(e.target.value) || 0 }))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Your MT5 password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={handleLogin} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Account'
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full"
            >
              Use Demo Account
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            <p>🔒 Your credentials are encrypted and stored securely</p>
            <p>MarketMind AI never stores your actual passwords</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}