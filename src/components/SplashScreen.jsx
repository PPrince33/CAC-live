import React from 'react';

const SplashScreen = () => {
    return (
        <div className="splash">
            <div className="t-box t-shadow-lg p-5" style={{ maxWidth: 320, width: '90%', textAlign: 'center' }}>
                <div className="text-xs font-black uppercase text-muted tracking-widest mb-4">SESSION START UP</div>
                <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ opacity: 0.6 }}>WELCOME TO</div>
                <div className="mb-4">
                    <div className="text-5xl font-black uppercase tracking-tight text-red" style={{ lineHeight: 1 }}>CAC</div>
                    <div className="text-lg font-black uppercase tracking-widest mt-1">QUICK STATS</div>
                </div>
                <div style={{ height: 4, background: '#000', width: '100%', marginBottom: 16 }}></div>
                <div className="text-xs font-bold uppercase tracking-widest animate-pulse">ESTABLISHING DATA LINK...</div>
            </div>
        </div>
    );
};

export default SplashScreen;
