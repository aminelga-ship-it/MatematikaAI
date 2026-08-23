import type { LpExpressTerminal } from '@/types/lpExpress';

export type RecipientInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export type CheckoutPayload = {
  calculatorId: string;
  recipient: RecipientInfo;
  terminal: LpExpressTerminal;
};
