'use client';
import { Transaction } from '@/types';
import React, { useState, useEffect } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'income' as 'income' | 'expense'
  });

  // Load transactions from localStorage after mount
  useEffect(() => {
    setMounted(true);
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions);
        setTransactions(parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        })));
      } catch (err) {
        console.error('Error loading transactions:', err);
      }
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/service-worker.ts')
        .then((registration) => console.log('SW registered:', registration.scope))
        .catch((err) => console.log('SW registration failed:', err));
    }
  }, []);

  // Save transactions to localStorage
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem('transactions', JSON.stringify(transactions));
      } catch (err) {
        console.error('Error saving transactions:', err);
      }
    }
  }, [transactions, mounted]);

  if (!mounted) {
    return null; // Prevent hydration issues
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
      localStorage.clear();
      setTransactions([]);
    }
  };



	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleTransactionTypeSelect = (type: 'income' | 'expense') => {
		setFormData(prev => ({
			...prev,
			type
		}));
		setShowForm(true);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		const newTransaction: Transaction = {
			id: Date.now().toString(),
			description: formData.description,
			amount: parseFloat(formData.amount),
			type: formData.type,
			date: new Date()
		};

		setTransactions(prev => [...prev, newTransaction]);
		setFormData({
			description: '',
			amount: '',
			type: 'income'
		});
		setShowForm(false);
	};

	const totalBalance = transactions.reduce((acc, curr) => {
		return curr.type === 'income' 
			? acc + curr.amount 
			: acc - curr.amount;
	}, 0);

	return (
<main className="min-h-screen p-8 max-w-3xl mx-auto">
  <h1 className="text-3xl font-bold mb-8 text-center">Income & Expense Tracker</h1>
  
  <div className="mb-8 text-center">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-xl font-semibold">ആകെ തുക</h2>
      <button
        onClick={handleReset}
        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
      >
        Reset All
      </button>
    </div>
    <p className={`text-4xl mt-2 ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
    ₹{totalBalance.toFixed(2)}
    </p>
  </div>

			{!showForm ? (
				<div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 sm:mb-8">
					<button
						onClick={() => handleTransactionTypeSelect('income')}
						className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 text-lg sm:text-xl"
					>
						വരവ് 
					</button>
					<button
						onClick={() => handleTransactionTypeSelect('expense')}
						className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 text-lg sm:text-xl"
					>
						ചിലവ് 
					</button>
				</div>
			) : (
				<div className="w-full max-w-md mx-auto bg-white p-4 sm:p-6 rounded-lg shadow">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-semibold">
							Add {formData.type === 'income' ? 'Income' : 'Expense'}
						</h2>
						<button
							onClick={() => setShowForm(false)}
							className="text-gray-500 hover:text-gray-700"
						>
							Cancel
						</button>
					</div>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block mb-1">Description</label>
							<input 
								type="text" 
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								className="w-full border rounded p-2"
								placeholder="Enter description"
								required
							/>
						</div>
						<div>
							<label className="block mb-1">തുക</label>
							<input 
								type="number" 
								name="amount"
								value={formData.amount}
								onChange={handleInputChange}
								className="w-full border rounded p-2"
								placeholder="Enter amount"
								step="0.01"
								min="0"
								required
							/>
						</div>
						<button 
							type="submit"
							className={`w-full text-white py-2 rounded ${
								formData.type === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
							}`}
						>
							Add {formData.type === 'income' ? 'Income' : 'Expense'}
						</button>
					</form>
				</div>
			)}

  {transactions.length > 0 && (
  <div className="w-full max-w-md mx-auto mt-8 bg-white p-6 rounded-lg shadow">
    <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
    <div className="space-y-2">
    {transactions.slice().reverse().map(transaction => (
      <div 
      key={transaction.id} 
      className="flex justify-between p-2 border rounded items-center"
      >
      <div className="overflow-hidden">
        <p className="truncate">{transaction.description}</p>
        <p className="text-sm text-gray-500">
        {new Date(transaction.date).toLocaleDateString()}
        </p>
      </div>
      <span className={`ml-2 whitespace-nowrap ${
        transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
      }`}>
        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
      </span>
      </div>
    ))}
    </div>
  </div>
  )}
		</main>
	);
}