import React from 'react';
import type { Receipt } from '../types';

interface ReceiptDisplayProps {
  receipt: Receipt;
  tipPercentage: number;
  onTipChange: (value: number) => void;
}

const ReceiptDisplay: React.FC<ReceiptDisplayProps> = ({ receipt, tipPercentage, onTipChange }) => {
  const tipAmount = (receipt.subtotal * tipPercentage) / 100;
  const grandTotal = receipt.subtotal + receipt.tax + tipAmount;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-800 border-b pb-3 mb-4">Receipt Details</h2>
        <div className="flow-root">
          <ul role="list" className="-my-4 divide-y divide-slate-200">
            {receipt.items.map((item, index) => (
              <li key={index} className="flex items-center py-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.quantity} x ${item.price.toFixed(2)}</p>
                </div>
                <div className="ml-4 font-medium text-slate-900">${(item.quantity * item.price).toFixed(2)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-3 pt-6 border-t border-slate-200">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-medium">${receipt.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Tax</span>
          <span className="font-medium">${receipt.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center text-slate-600">
            <label htmlFor="tip-percentage" className="pr-4">Tip</label>
            <div className="relative">
                <input 
                    id="tip-percentage"
                    type="number"
                    value={tipPercentage}
                    onChange={(e) => onTipChange(Number(e.target.value))}
                    className="w-24 pl-3 pr-6 py-1.5 text-right border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">%</span>
            </div>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Tip Amount</span>
          <span className="font-medium">${tipAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-slate-900 pt-3 mt-3 border-t border-slate-200">
          <span>Grand Total</span>
          <span>${grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ReceiptDisplay;