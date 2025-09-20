
import React, { useMemo, useState } from 'react';
import type { Tour, Person, Expense } from '../types';
import { DollarSignIcon, PlusIcon, PaperclipIcon, HourglassIcon, CheckCircle2Icon, XCircleIcon, EditIcon, TrashIcon, CalendarIcon } from './IconComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface FinancesViewProps {
    tour: Tour;
    people: Person[];
    currentUser: Person;
    onAddExpenseClick: () => void;
    onEditExpenseClick: (expense: Expense) => void;
    onDeleteExpense: (expenseId: string) => void;
    onUpdateExpenseStatus: (expenseId: string, status: 'approved' | 'rejected') => void;
}

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export const FinancesView: React.FC<FinancesViewProps> = ({ tour, people, currentUser, onAddExpenseClick, onEditExpenseClick, onDeleteExpense, onUpdateExpenseStatus }) => {
    const { financials } = tour;
    const hasFinanceWriteAccess = currentUser.role === 'Tour Manager';
    
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    const peopleMap = useMemo(() => people.reduce((acc, p) => ({ ...acc, [p.id]: p }), {} as { [key: string]: Person }), [people]);

    const availableCategories = useMemo(() => {
        const cats = new Set(financials?.budget.map(b => b.category) || []);
        return Array.from(cats);
    }, [financials?.budget]);

    const filteredExpenses = useMemo(() => {
        return (financials?.expenses || []).filter(expense => {
            // Add 'T00:00:00' to ensure dates are compared in local timezone without time offsets.
            const expenseDate = new Date(`${expense.date}T00:00:00`);
            const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
            const end = endDate ? new Date(`${endDate}T00:00:00`) : null;

            if (start && expenseDate < start) return false;
            if (end && expenseDate > end) return false;
            if (selectedCategory !== 'all' && expense.category !== selectedCategory) return false;
            
            return true;
        });
    }, [financials?.expenses, startDate, endDate, selectedCategory]);

    const approvedExpenses = useMemo(() => filteredExpenses.filter(e => e.status === 'approved'), [filteredExpenses]);
    const pendingExpenses = useMemo(() => filteredExpenses.filter(e => e.status === 'pending'), [filteredExpenses]);

    const budgetTotal = useMemo(() => financials?.budget.reduce((sum, item) => sum + item.amount, 0) || 0, [financials]);
    const approvedExpensesTotal = useMemo(() => approvedExpenses.reduce((sum, item) => sum + item.amount, 0), [approvedExpenses]);
    const pendingExpensesTotal = useMemo(() => pendingExpenses.reduce((sum, item) => sum + item.amount, 0), [pendingExpenses]);
    const budgetRemaining = budgetTotal - approvedExpensesTotal;

    const budgetByCategory = useMemo(() => {
        const cats: { [key: string]: { budget: number, spent: number } } = {};
        financials?.budget.forEach(b => {
            if (!cats[b.category]) cats[b.category] = { budget: 0, spent: 0 };
            cats[b.category].budget += b.amount;
        });
        approvedExpenses.forEach(e => {
            if (!cats[e.category]) cats[e.category] = { budget: 0, spent: 0 };
            cats[e.category].spent += e.amount;
        });
        return cats;
    }, [financials, approvedExpenses]);

    const chartData = useMemo(() => {
        return Object.entries(budgetByCategory).map(([name, { budget, spent }]) => ({
            name,
            Spent: spent > budget ? budget : spent,
            Remaining: spent > budget ? 0 : budget - spent,
            Overbudget: spent > budget ? spent - budget : 0,
        }));
    }, [budgetByCategory]);

    const formatXAxis = (tickItem: number) => `$${tickItem / 1000}k`;
    
    const handleResetFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedCategory('all');
    };

    if (!financials) {
        return <div className="text-center py-16 text-slate-500">No financial data available for this tour.</div>;
    }
    
    const getStatusInfo = (status: 'pending' | 'approved' | 'rejected') => {
        switch (status) {
            case 'approved': return { text: 'Approved', icon: <CheckCircle2Icon className="w-4 h-4 text-green-600"/>, chip: 'bg-green-100 text-green-800' };
            case 'pending': return { text: 'Pending', icon: <HourglassIcon className="w-4 h-4 text-yellow-600"/>, chip: 'bg-yellow-100 text-yellow-800' };
            case 'rejected': return { text: 'Rejected', icon: <XCircleIcon className="w-4 h-4 text-red-600"/>, chip: 'bg-red-100 text-red-800' };
        }
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column - Dashboard */}
            <div className="md:col-span-1 space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-bold text-slate-800">Budget Overview</h3>
                    <div className="mt-2 space-y-2">
                        <div className="flex justify-between"><span>Total Budget:</span> <span className="font-semibold">{currencyFormatter.format(budgetTotal)}</span></div>
                        <div className="flex justify-between"><span>Approved Spending:</span> <span className="font-semibold text-red-600">{currencyFormatter.format(approvedExpensesTotal)}</span></div>
                        <div className="flex justify-between text-sm text-slate-500"><span>Pending Approval:</span> <span className="font-semibold">{currencyFormatter.format(pendingExpensesTotal)}</span></div>
                        <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Remaining:</span> <span className={budgetRemaining < 0 ? 'text-red-700' : 'text-green-700'}>{currencyFormatter.format(budgetRemaining)}</span></div>
                    </div>
                </div>
                 <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-bold text-slate-800">Spending by Category</h3>
                     <div className="mt-4" style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart 
                                data={chartData} 
                                layout="vertical" 
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis type="number" tickFormatter={formatXAxis} tick={{ fontSize: 12 }} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, width: 80 }} interval={0} />
                                <Tooltip 
                                    formatter={(value: number) => currencyFormatter.format(value)}
                                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} 
                                />
                                <Legend wrapperStyle={{ fontSize: '14px' }} />
                                <Bar dataKey="Spent" stackId="a" fill="#4f46e5" name="Spent" />
                                <Bar dataKey="Remaining" stackId="a" fill="#e2e8f0" name="Remaining Budget" />
                                <Bar dataKey="Overbudget" stackId="a" fill="#ef4444" name="Over Budget" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Right Column - Transactions */}
            <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Transactions</h3>
                    <button onClick={onAddExpenseClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 transition-colors">
                        <PlusIcon className="w-5 h-5" /> Add Expense
                    </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-3">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label htmlFor="startDate" className="text-xs font-medium text-slate-600">Start Date</label>
                                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm text-sm" />
                            </div>
                             <div>
                                <label htmlFor="endDate" className="text-xs font-medium text-slate-600">End Date</label>
                                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} min={startDate} className="w-full p-2 border border-slate-300 rounded-md shadow-sm text-sm" />
                            </div>
                        </div>
                        <div>
                             <label htmlFor="category" className="text-xs font-medium text-slate-600">Category</label>
                            <select id="category" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm bg-white text-sm">
                                <option value="all">All Categories</option>
                                {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                     <button onClick={handleResetFilters} className="mt-2 text-sm text-blue-600 hover:underline font-semibold">Reset Filters</button>
                </div>
                
                <div className="space-y-2">
                    {filteredExpenses.length > 0 ? filteredExpenses.slice().reverse().map(expense => {
                        const statusInfo = getStatusInfo(expense.status);
                        const canEditOrDelete = hasFinanceWriteAccess || (expense.submittedById === currentUser.id && expense.status === 'pending');
                        return (
                        <div key={expense.id} className="bg-white p-3 rounded-lg border border-slate-200 group">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-slate-800">{expense.description}</p>
                                    <div className="text-sm text-slate-500 flex items-center gap-2 flex-wrap">
                                        <span>{new Date(`${expense.date}T00:00:00`).toLocaleDateString()}</span>
                                        <span>&bull;</span>
                                        <span>{expense.category}</span>
                                        <span>&bull;</span>
                                        <span>by {peopleMap[expense.submittedById]?.name || 'Unknown'}</span>
                                        {expense.receiptUrl && (
                                            <>
                                            <span>&bull;</span>
                                            <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">
                                                <PaperclipIcon className="w-4 h-4" /> View Receipt
                                            </a>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0 ml-4">
                                     <p className="font-bold text-slate-800">{currencyFormatter.format(expense.amount)}</p>
                                     <div className={`mt-1 inline-flex items-center justify-end gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${statusInfo.chip}`}>
                                         {statusInfo.icon} {statusInfo.text}
                                     </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
                                {expense.status === 'pending' && hasFinanceWriteAccess && (
                                    <>
                                        <button onClick={() => onUpdateExpenseStatus(expense.id, 'rejected')} className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200">Reject</button>
                                        <button onClick={() => onUpdateExpenseStatus(expense.id, 'approved')} className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200">Approve</button>
                                    </>
                                )}
                                {canEditOrDelete && (
                                    <>
                                        <button onClick={() => onEditExpenseClick(expense)} className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 flex items-center gap-1">
                                            <EditIcon className="w-3 h-3" /> Edit
                                        </button>
                                         <button onClick={() => onDeleteExpense(expense.id)} className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-md hover:bg-red-100 hover:text-red-700 flex items-center gap-1">
                                            <TrashIcon className="w-3 h-3" /> Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}) : (
                        <div className="text-center text-slate-500 py-12">
                            <DollarSignIcon className="w-12 h-12 mx-auto text-slate-300" />
                            <h4 className="mt-2 font-semibold">No transactions found</h4>
                            <p className="text-sm">No expenses match the current filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
