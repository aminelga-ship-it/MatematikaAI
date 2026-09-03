import type { LpExpressTerminal } from '@/types/lpExpress';
import type { PostalAddress, ShippingMethod } from '@/types/shipping';

export type RecipientInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export type CheckoutPayload = {
  calculatorId: string;
  shippingMethod: ShippingMethod;
  recipient: RecipientInfo;
  terminal?: LpExpressTerminal;
  postalAddress?: PostalAddress;
};
