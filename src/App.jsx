import React, { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import HubScreen from './components/HubScreen';
import MatchListScreen from './components/MatchListScreen';
import Dashboard from './components/Dashboard';

function App() {
    const [view, setView] = useState('hub');
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowSplash(false), 2500);
        return () => clearTimeout(timer);
    }, []);

    if (showSplash) return <SplashScreen />;

    return (
        <div className="container">
            <header className="flex justify-between items-center mb-6 pb-2" style={{ borderBottom: '2px solid #000' }}>
                <div className="text-xs font-black uppercase tracking-tight">
                    CAC QUICK STATS <span className="text-muted">// ANALYTICS</span>
                </div>
                <a href="https://pp33.carrd.co" target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold uppercase tracking-tight px-2 py-1"
                    style={{ border: '1px solid #000', textDecoration: 'none', color: '#000', transition: 'all 0.15s' }}>
                    Made by PP33
                </a>
            </header>

            {view === 'hub' && (
                <HubScreen onSelect={(t) => { setSelectedTournament(t); setView('matches'); }} />
            )}
            {view === 'matches' && (
                <MatchListScreen
                    tournament={selectedTournament}
                    onSelect={(m) => { setSelectedMatch(m); setView('dashboard'); }}
                    onBack={() => setView('hub')}
                />
            )}
            {view === 'dashboard' && (
                <Dashboard
                    match={selectedMatch}
                    onBack={() => setView('matches')}
                />
            )}
        </div>
    );
}

export default App;
