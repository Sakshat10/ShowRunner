import React, { useState, useEffect } from 'react';
import type { Person } from '../types';
import { MusicNoteIcon } from './IconComponents';

interface AuthProps {
    users: Person[];
    onLogin: (credentials: Pick<Person, 'email' | 'password'>) => boolean;
    onRegister: (userData: Pick<Person, 'name' | 'email' | 'password'>) => void;
    onSetPassword: (data: { email: string; password?: string }) => void;
}

type AuthMode = 'login' | 'register' | 'check_invite' | 'set_password';

export const Auth: React.FC<AuthProps> = ({ users, onLogin, onRegister, onSetPassword }) => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState(users.length > 0 ? 'alex@showrunner.app' : '');
    const [password, setPassword] = useState(users.length > 0 ? 'password123' : '');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (users.length === 0) {
            setMode('register');
        } else {
            setMode('login');
        }
    }, [users.length]);
    
    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        onLogin({ email, password });
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        onRegister({ name, email, password });
    };
    
    const handleCheckInviteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const invitedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.status === 'pending_invitation');
        if (invitedUser) {
            setMode('set_password');
        } else {
            setError('No pending invitation found for this email address.');
        }
    };
    
    const handleSetPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        onSetPassword({ email, password });
    };

    const renderContent = () => {
        switch (mode) {
            case 'register':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-center text-slate-800">Create Admin Account</h2>
                        <p className="text-center text-slate-500 mb-6">Welcome to ShowRunner! Let's set up the first account.</p>
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Register</button>
                        </form>
                    </>
                );
            case 'set_password':
                return (
                    <>
                        <h2 className="text-2xl font-bold text-center text-slate-800">Set Your Password</h2>
                        <p className="text-center text-slate-500 mb-6">Final step to activate your account for <span className="font-semibold">{email}</span>.</p>
                        <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">New Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Set Password & Login</button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            <span className="text-slate-500">Remembered your password? </span>
                            <button onClick={() => setMode('login')} className="font-medium text-blue-600 hover:underline">Log in</button>
                        </div>
                    </>
                );
            case 'check_invite':
                return (
                     <>
                        <h2 className="text-2xl font-bold text-center text-slate-800">Create Your Account</h2>
                        <p className="text-center text-slate-500 mb-6">If you've been invited to a team, enter your email to continue.</p>
                        <form onSubmit={handleCheckInviteSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Sign Up</button>
                        </form>
                        <div className="mt-4 text-center text-sm">
                            <span className="text-slate-500">Already have an account? </span>
                            <button onClick={() => setMode('login')} className="font-medium text-blue-600 hover:underline">Log in</button>
                        </div>
                    </>
                );
            case 'login':
            default:
                return (
                    <>
                        <h2 className="text-2xl font-bold text-center text-slate-800">Welcome Back</h2>
                        <p className="text-center text-slate-500 mb-6">Sign in to your ShowRunner account.</p>

                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r-lg">
                            <p className="text-sm text-blue-800">
                                Use the pre-filled demo account to explore the app.
                                <br />
                                <strong>Email:</strong> alex@showrunner.app
                                <br />
                                <strong>Password:</strong> password123
                            </p>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                            </div>
                            <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">Sign In</button>
                        </form>
                         <div className="mt-4 text-center text-sm">
                            <span className="text-slate-500">Don't have an account? </span>
                            <button onClick={() => setMode('check_invite')} className="font-medium text-blue-600 hover:underline">Sign up</button>
                        </div>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <div className="flex items-center space-x-3 mb-8">
                <MusicNoteIcon className="w-10 h-10 text-blue-600" />
                <span className="text-4xl font-bold text-slate-800">ShowRunner</span>
            </div>
            <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
                {error && <p className="mb-4 text-center text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}
                {renderContent()}
            </div>
        </div>
    );
};