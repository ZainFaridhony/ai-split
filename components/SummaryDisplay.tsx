import React from 'react';
import type { Bill, PersonBill, Receipt } from '../types';

interface SummaryDisplayProps {
  bill: Bill;
  receipt: Receipt;
  tipPercentage: number;
}

const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ bill, receipt, tipPercentage }) => {
    
    const calculateTotals = (personTotal: number) => {
        if (receipt.subtotal === 0) return { tax: 0, tip: 0, total: personTotal };
        const proportion = personTotal / receipt.subtotal;
        const taxShare = receipt.tax * proportion;
        const tipShare = (receipt.subtotal * tipPercentage / 100) * proportion;
        const finalTotal = personTotal + taxShare + tipShare;
        return {
            tax: taxShare,
            tip: tipShare,
            total: finalTotal
        };
    };

  return (
    <div>
        <h2 className="text-xl font-semibold text-slate-800 border-b pb-3 mb-4">Bill Summary</h2>
        <div className="space-y-4">
        {Object.entries(bill).map(([person, data]: [string, PersonBill]) => {
            if (data.items.length === 0) return null;
            const { tax, tip, total } = calculateTotals(data.total);
            const isUnassigned = person === 'Unassigned';

            return (
                <div key={person} className={`rounded-xl ${isUnassigned ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-transparent shadow-sm'}`}>
                    <div className="p-4">
                        <h3 className={`text-lg font-bold mb-3 ${isUnassigned ? 'text-yellow-800' : 'text-slate-800'}`}>{person}</h3>
                        <ul className="space-y-2 text-sm text-slate-600">
                        {data.items.map((item, index) => (
                            <li key={item.uniqueId || index} className="flex justify-between items-center">
                                <span>{item.name} {item.sharedWith && item.sharedWith > 1 ? <span className="text-xs text-slate-400 font-medium ml-1">(1/{item.sharedWith})</span>: ''}</span>
                                <span className="font-mono">${item.price.toFixed(2)}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                    {!isUnassigned && (
                         <div className="mt-2 px-4 py-3 border-t border-slate-200/80 bg-slate-50/30 rounded-b-xl space-y-1">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Subtotal</span>
                                <span className="font-mono">${data.total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Tax</span>
                                <span className="font-mono">${tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>Tip</span>
                                <span className="font-mono">${tip.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-800 text-sm pt-1">
                                <span>Total</span>
                                <span className="font-mono">${total.toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                     {isUnassigned && (
                        <div className="mt-2 px-4 py-3 border-t border-yellow-200 bg-yellow-100/50 rounded-b-xl">
                             <div className="flex justify-between font-bold text-yellow-800 text-sm">
                                <span>Remaining Items Total</span>
                                <span className="font-mono">${data.total.toFixed(2)}</span>
                            </div>
                        </div>
                     )}
                </div>
            );
        })}
        </div>
    </div>
  );
};

export default SummaryDisplay;