import React, { useState, useCallback, useMemo } from 'react';
import { analyzeReceipt, processAssignment } from './services/geminiService';
import type { Receipt, Bill, ReceiptItem } from './types';
import ReceiptUploader from './components/ReceiptUploader';
import ReceiptDisplay from './components/ReceiptDisplay';
import ChatInterface from './components/ChatInterface';
import SummaryDisplay from './components/SummaryDisplay';

// --- Custom SVG Icons (replaces Heroicons) ---

const LoadingSpinner = () => (
  <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
  </svg>
);

const ErrorIcon = () => (
    <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
    </svg>
);


export default function App() {
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [receiptData, setReceiptData] = useState<Receipt | null>(null);
  const [bill, setBill] = useState<Bill>({});
  const [tipPercentage, setTipPercentage] = useState<number>(15);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ user: string; bot: string; }[]>([]);

  const handleImageUpload = useCallback(async (file: File) => {
    setReceiptImage(file);
    setIsLoading('Analyzing receipt...');
    setError(null);
    setReceiptData(null);
    setBill({});
    setChatHistory([]);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result?.toString().split(',')[1];
        if (base64data) {
          const data = await analyzeReceipt(base64data, file.type);
          setReceiptData(data);
          const initialBillState: Bill = {};
          data.items.forEach((item, index) => {
             const uniqueId = `${item.name}-${index}`;
             if(!initialBillState['Unassigned']) {
                initialBillState['Unassigned'] = { items: [], total: 0 };
             }
             initialBillState['Unassigned'].items.push({ ...item, uniqueId });
             initialBillState['Unassigned'].total += item.price;
          });
          setBill(initialBillState);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to analyze receipt. Please try another image.');
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  }, []);

  const handleChatMessage = useCallback(async (message: string) => {
    if (!receiptData) return;
    setIsLoading('Updating assignments...');
    setError(null);

    try {
      const assignment = await processAssignment(message, receiptData.items, bill);
      
      setChatHistory(prev => [...prev, { user: message, bot: 'Updated bill.' }]);

      setBill(currentBill => {
        const newBill = JSON.parse(JSON.stringify(currentBill));

        assignment.updates.forEach(update => {
            const itemToMove = newBill['Unassigned']?.items.find((i: ReceiptItem) => i.name.toLowerCase() === update.itemName.toLowerCase());

            if (itemToMove) {
                newBill['Unassigned'].items = newBill['Unassigned'].items.filter((i: ReceiptItem) => i.uniqueId !== itemToMove.uniqueId);
                newBill['Unassigned'].total -= itemToMove.price;

                const people = update.isShared ? update.sharedWith : [update.personName];
                const pricePerPerson = itemToMove.price / people.length;

                people.forEach(person => {
                    if (!newBill[person]) {
                        newBill[person] = { items: [], total: 0 };
                    }
                    const splitItem = { ...itemToMove, price: pricePerPerson, originalPrice: itemToMove.price, sharedWith: people.length };
                    newBill[person].items.push(splitItem);
                    newBill[person].total += pricePerPerson;
                });
            }
        });

        return newBill;
      });

    } catch (err) {
      setError('Could not process the command. Please try rephrasing.');
      console.error(err);
    } finally {
      setIsLoading(null);
    }
  }, [receiptData, bill]);

  const appTitle = (
    <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Bill Splitter</h1>
            <p className="text-slate-500 text-sm">Upload a receipt, then chat to split the bill.</p>
        </div>
    </header>
  );

  const loadingOverlay = isLoading && (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
      <LoadingSpinner />
      <p className="mt-4 text-lg font-semibold text-slate-700">{isLoading}</p>
    </div>
  );

  const errorDisplay = error && (
     <div className="m-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-3">
        <ErrorIcon/>
        <span className="font-medium">{error}</span>
     </div>
  );


  return (
    <div className="min-h-screen flex flex-col">
      {appTitle}
      <main className="flex-grow p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full relative">
            {/* Left Pane */}
            <div className="bg-white rounded-xl shadow-md flex flex-col relative overflow-hidden h-[calc(100vh-120px)]">
                {loadingOverlay}
                {!receiptImage ? (
                    <ReceiptUploader onImageUpload={handleImageUpload} isLoading={!!isLoading} />
                ) : (
                    <div className="flex-grow overflow-y-auto p-4 md:p-6">
                        {errorDisplay}
                        {receiptData && <ReceiptDisplay receipt={receiptData} onTipChange={setTipPercentage} tipPercentage={tipPercentage} />}
                    </div>
                )}
            </div>

            {/* Right Pane */}
            <div className="bg-white rounded-xl shadow-md flex flex-col overflow-hidden h-[calc(100vh-120px)]">
               {receiptData ? (
                 <>
                   <div className="flex-grow p-4 md:p-6 overflow-y-auto bg-slate-50/50">
                     <SummaryDisplay bill={bill} receipt={receiptData} tipPercentage={tipPercentage} />
                   </div>
                   <div className="p-4 border-t border-slate-200 bg-white">
                     <ChatInterface onSendMessage={handleChatMessage} isDisabled={!!isLoading || !receiptData} chatHistory={chatHistory} />
                   </div>
                 </>
               ) : (
                <div className="flex items-center justify-center h-full bg-slate-50/50 rounded-b-xl">
                    <p className="text-slate-500 text-lg">Upload a receipt to start splitting</p>
                </div>
               )}
            </div>
        </div>
      </main>
    </div>
  );
}