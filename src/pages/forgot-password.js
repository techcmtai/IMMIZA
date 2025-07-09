import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function ForgotPassword() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const response = await fetch('/api/auth/send-password-reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                setEmail('');
                // Optionally redirect after a delay
                // setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (    
        <div className="flex justify-center items-center h-screen">     
            <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
                {success && <p className="text-green-500 mb-4">{success}</p>}
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input 
                            type="email"
                            id="email"
                            className="mt-1 p-2 block w-full rounded-md bg-gray-100 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full py-3 px-4 bg-[#b76e79] hover:bg-[#864a53] text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}       