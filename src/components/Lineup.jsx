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

    const renderTable = (players, teamName, isHome) => {
        const starters = players.filter(p => p.is_starting);
        const subs = players.filter(p => !p.is_starting);
        const hasPosition = players.some(p => p.position);

        const renderRows = (list) => list.map(p => (
            <tr key={p.id} className="text-[10px] font-bold">
                <td className={`py-0.5 ${!p.is_starting ? 'text-muted' : ''}`}>{p.player_name}</td>
                <td className="py-0.5 text-center w-8 opacity-50">{p.jersey_number}</td>
                {hasPosition && <td className="py-0.5 text-right text-[8px] uppercase opacity-50">{p.position}</td>}
            </tr>
        ));

        return (
            <div className="flex-1">
                <div className={`text-[10px] font-black uppercase mb-2 pb-1 border-b-2 border-black ${isHome ? 'text-red' : 'text-blue'}`}>
                    {teamName}
                </div>
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="text-[8px] uppercase opacity-30">
                            <th className="font-black">PLAYER</th>
                            <th className="font-black text-center">NO.</th>
                            {hasPosition && <th className="font-black text-right">POS</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {renderRows(starters)}
                        {subs.length > 0 && (
                            <>
                                <tr><td colSpan={hasPosition ? 3 : 2} className="py-2 opacity-30 text-[8px] font-black uppercase border-b border-black">SUBSTITUTES</td></tr>
                                {renderRows(subs)}
                            </>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="t-box p-3 mb-4 bg-white">
            <div className="text-[10px] font-black uppercase mb-3 opacity-50">MATCH LINEUPS</div>
            <div className="flex gap-6">
                {renderTable(lineups.teamA, teamAName, true)}
                <div style={{ width: 1, background: '#000', opacity: 0.1 }}></div>
                {renderTable(lineups.teamB, teamBName, false)}
            </div>
        </div>
    );
};

export default Lineup;
