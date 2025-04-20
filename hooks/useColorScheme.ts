// hooks/useColorScheme.ts
import { useTheme } from "@/contexts/themeContext";

export function useColorScheme() {
  const { theme } = useTheme();
  return theme;
}
