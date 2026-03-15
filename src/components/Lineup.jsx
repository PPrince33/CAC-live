import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const Lineup = ({ matchId, teamAId, teamBId, teamAName, teamBName }) => {
    const [lineups, setLineups] = useState({ teamA: [], teamB: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLineups = async () => {
            const { data, error } = await supabase
                .from('lineups')
                .select('*')
                .eq('match_id', matchId);

            if (data) {
                const teamA = data.filter(p => p.team_id === teamAId);
                const teamB = data.filter(p => p.team_id === teamBId);
                setLineups({ teamA, teamB });
            }
            setLoading(false);
        };

        fetchLineups();
    }, [matchId, teamAId, teamBId]);

    if (loading) return <div className="text-[10px] font-black uppercase animate-pulse">Loading Lineups...</div>;
    if (lineups.teamA.length === 0 && lineups.teamB.length === 0) return null;

    const renderList = (players, teamName, isHome) => (
        <div className="flex-1">
            <div className={`text-[10px] font-black uppercase mb-2 pb-1 border-b-2 border-black ${isHome ? 'text-red' : 'text-blue'}`}>
                {teamName}
            </div>
            <div className="flex flex-col gap-1">
                {players.sort((a,b) => (a.is_starting === b.is_starting ? 0 : a.is_starting ? -1 : 1)).map((p, i) => (
                    <div key={p.id} className="flex justify-between items-center text-[10px] font-bold">
                        <span className={p.is_starting ? '' : 'text-muted'}>
                            {p.jersey_number && <span className="mr-1 opacity-50">#{p.jersey_number}</span>}
                            {p.player_name}
                        </span>
                        <span className="text-[8px] uppercase opacity-50">{p.position}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="t-box p-3 mb-4 bg-white">
            <div className="text-[10px] font-black uppercase mb-3 opacity-50">MATCH LINEUPS</div>
            <div className="flex gap-4">
                {renderList(lineups.teamA, teamAName, true)}
                <div style={{ width: 1, background: '#000', opacity: 0.1 }}></div>
                {renderList(lineups.teamB, teamBName, false)}
            </div>
        </div>
    );
};

export default Lineup;
