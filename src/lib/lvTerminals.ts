import type { LpExpressTerminalsByCity } from '@/types/lpExpress';

type LockerFile = {
  unisend: LpExpressTerminalsByCity;
  omniva: LpExpressTerminalsByCity;
};

export async function fetchLvLockers(carrier: 'unisend' | 'omniva'): Promise<LpExpressTerminalsByCity> {
  const file = (await import('@/data/lvLockers.json')).default as LockerFile;
  const terminals = file[carrier];
  if (!terminals || Object.keys(terminals).length === 0) {
    throw new Error('Neizdevās ielādēt pakomātus');
  }
  return terminals;
}
