import { useEffect, useState } from 'react';
import authBg from '../assets/auth-bg.png';

const AuthLayout = ({ children, title, subtitle }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="min-h-screen w-full flex bg-blue-50 font-sans text-slate-900">
            {/* Left Panel - Professional Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden flex-col justify-between p-16 text-white">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src={authBg}
                        alt="Medical Facility"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90 mix-blend-multiply"></div>
                </div>

                {/* Brand Header */}
                <div className="relative z-10 animate-fade-in">
                    <div className="flex items-center gap-3 mb-8 transform hover:scale-105 transition-all duration-300 cursor-pointer">
                        <div className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300">
                            <svg className="w-6 h-6 text-white transition-transform duration-300 hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-white font-heading hover:text-blue-200 transition-colors duration-300">MediLink</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="relative z-10 max-w-lg animate-slide-up">
                    <h1 className="text-5xl font-bold leading-tight mb-6 text-white font-heading">
                        Healthcare <br />
                        <span className="text-blue-400">Excellence.</span>
                    </h1>
                    <p className="text-slate-200 text-lg leading-relaxed mb-10 font-light">
                        Experience the future of medical practice management. Secure, efficient, and designed for modern healthcare professionals.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-white">HIPAA Compliant</h3>
                                <p className="text-sm text-slate-400">Enterprise-grade security standards</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-xs text-slate-400 flex items-center gap-6">
                    <span>© {new Date().getFullYear()} MediLink Systems</span>
                    <a href="#" className="hover:text-white hover:scale-105 transition-all duration-300 transform">Privacy Policy</a>
                    <a href="#" className="hover:text-white hover:scale-105 transition-all duration-300 transform">Terms of Service</a>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-blue-50">
                <div className={`w-full max-w-md transition-all duration-700 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight font-heading">{title}</h2>
                        <p className="text-slate-500 text-lg">{subtitle}</p>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
