export type LpExpressTerminal = {
  id: string;
  code: string;
  city: string;
  name: string;
  address: string;
  comment: string;
};

export type LpExpressTerminalsByCity = Record<string, LpExpressTerminal[]>;
