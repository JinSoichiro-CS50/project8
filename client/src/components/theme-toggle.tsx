
import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../contexts/theme-context';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur-sm border-border/50 hover:bg-accent/50"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-foreground" />
      ) : (
        <Sun className="h-4 w-4 text-foreground" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
