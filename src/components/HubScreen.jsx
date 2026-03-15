import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const HubScreen = ({ onSelect }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTournaments = async () => {
            const { data } = await supabase.from('tournaments')
                .select('*')
                .eq('Is_visible', true)
                .order('created_at', { ascending: false });
            setItems(data || []);
            setLoading(false);
        };
        fetchTournaments();
    }, []);

    if (loading) return <div className="text-xs font-bold uppercase tracking-widest animate-pulse">ESTABLISHING CONNECTION...</div>;

    return (
        <div>
            <div className="text-xs font-bold text-muted uppercase mb-3">AVAILABLE TOURNAMENTS</div>
            {items.length === 0 && <div className="text-xs text-muted uppercase font-bold">No tournaments available</div>}
            {items.map((t, i) => (
                <div key={t.id} className="t-box t-shadow mb-3">
                    <button className="tournament-btn" onClick={() => onSelect(t)}>
                        <span>[{String(i + 1).padStart(2, '0')}] {t.name}</span>
                        <span>→</span>
                    </button>
                </div>
            ))}
        </div>
    );
};

export default HubScreen;
