import type { LpExpressTerminalsByCity } from '@/types/lpExpress';

export async function fetchLpExpressTerminals(): Promise<LpExpressTerminalsByCity> {
  const response = await fetch('/api/terminals');

  const data = (await response.json()) as {
    terminals?: LpExpressTerminalsByCity;
    error?: string;
  };

  if (!response.ok || !data.terminals) {
    throw new Error(data.error ?? 'Nepavyko įkelti paštomatų sąrašo');
  }

  return data.terminals;
}
