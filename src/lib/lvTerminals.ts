import type { LpExpressTerminalsByCity } from '@/types/lpExpress';

export async function fetchLvLockers(carrier: 'unisend' | 'omniva'): Promise<LpExpressTerminalsByCity> {
  const response = await fetch(`/api/lv-terminals?carrier=${carrier}`);

  const data = (await response.json()) as {
    terminals?: LpExpressTerminalsByCity;
    error?: string;
  };

  if (!response.ok || !data.terminals) {
    throw new Error(data.error ?? 'Neizdevās ielādēt pakomātus');
  }

  return data.terminals;
}
