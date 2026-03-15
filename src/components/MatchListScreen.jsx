import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const MatchListScreen = ({ tournament, onSelect, onBack }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        const { data } = await supabase.from('matches')
            .select('*, team_a:teams!team_a_id(*), team_b:teams!team_b_id(*)')
            .eq('tournament_id', tournament.id)
            .in('status', ['Live', 'Finished', 'Published'])
            .order('start_time', { ascending: false });
        setMatches(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        const channel = supabase.channel('match-list-rt')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchData)
            .subscribe();
        const interval = setInterval(fetchData, 15000);
        return () => { supabase.removeChannel(channel); clearInterval(interval); };
    }, [tournament.id]);

    return (
        <div>
            <div className="flex justify-between items-end gap-2 mb-4">
                <button className="btn-back" onClick={onBack}>← BACK TO HUB</button>
                <div className="font-black uppercase text-xs px-2 py-1" style={{ background: '#000', color: '#fff', maxWidth: '60%' }}>
                    <span className="truncate" style={{ display: 'block' }}>{tournament.name}</span>
                </div>
            </div>
            {loading ? (
                <div className="text-xs font-bold animate-pulse uppercase">RETRIEVING MATCH DATA...</div>
            ) : matches.length === 0 ? (
                <div className="text-xs text-muted uppercase font-bold">No matches available yet</div>
            ) : matches.map(m => {
                const isLive = m.status === 'Live';
                const hasScore = m.team_a_score !== null && m.team_b_score !== null;
                return (
                    <div key={m.id} className="t-box t-shadow match-card" onClick={() => onSelect(m)}>
                        <div className="flex justify-between mb-2 items-center">
                            {isLive ? (
                                <span className="text-red font-black text-xs blink">[ LIVE ]</span>
                            ) : (
                                <span className="text-muted font-black text-xs">[ {m.status?.toUpperCase() || 'FINAL'} ]</span>
                            )}
                            {m.is_futsal && <span className="text-xs font-bold text-muted">FUTSAL</span>}
                        </div>

                        <div className="flex justify-between items-center pb-2 gap-4" style={{ borderBottom: '2px solid #000' }}>
                            <div className="flex flex-col gap-2 min-w-0 flex-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    {m.team_a?.Logo && <img src={m.team_a.Logo} alt="" className="w-5 h-5 object-contain" />}
                                    <span className="truncate uppercase font-black text-sm" style={{ lineHeight: 1 }}>{m.team_a?.name}</span>
                                </div>
                                <div className="flex items-center gap-2 min-w-0">
                                    {m.team_b?.Logo && <img src={m.team_b.Logo} alt="" className="w-5 h-5 object-contain" />}
                                    <span className="truncate uppercase font-black text-sm" style={{ lineHeight: 1 }}>{m.team_b?.name}</span>
                                </div>
                            </div>

                            <div className="flex-none flex items-center justify-center min-w-[60px]">
                                {hasScore ? (
                                    <div className="flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono', fontSize: 18, fontWeight: 900 }}>
                                        <span className="text-red">{m.team_a_score}</span>
                                        <span className="text-muted opacity-30">:</span>
                                        <span className="text-blue">{m.team_b_score}</span>
                                    </div>
                                ) : (
                                    <span className="text-[10px] font-black px-1.5 py-0.5" style={{ background: '#000', color: '#fff' }}>VS</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between mt-2 items-center">
                            <span className="text-muted text-xs font-bold uppercase">{m.details ? m.details.toUpperCase() : ''}</span>
                            <span className="text-xs font-black uppercase tracking-tight">ENTER →</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default MatchListScreen;
