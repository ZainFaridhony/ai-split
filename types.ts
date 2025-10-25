
export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  uniqueId?: string; // For tracking items
  originalPrice?: number;
  sharedWith?: number;
}

export interface Receipt {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface PersonBill {
  items: ReceiptItem[];
  total: number;
}

export interface Bill {
  [personName: string]: PersonBill;
}

export interface AssignmentUpdate {
  itemName: string;
  personName: string;
  isShared: boolean;
  sharedWith: string[];
}

export interface AssignmentResponse {
  updates: AssignmentUpdate[];
  newPeople: string[];
}
