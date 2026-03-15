import React from 'react';

const PlayerTable = ({ keyEvents, match }) => {
    const scorers = {};
    const assists = {};
    const cards = {};
    keyEvents.forEach(ev => {
        const name = ev.player_name || 'Unknown';
        const team = ev.isHome ? match.team_a?.name : match.team_b?.name;
        const key = `${name}|${team}`;
        if (ev.display === 'Goal' || ev.display === 'Own Goal') {
            if (!scorers[key]) scorers[key] = { name, team, count: 0, isOG: ev.display === 'Own Goal' };
            scorers[key].count++;
        }
        if (ev.display === 'Assist') {
            if (!assists[key]) assists[key] = { name, team, count: 0 };
            assists[key].count++;
        }
        if (ev.display === 'Yellow Card' || ev.display === 'Red Card') {
            if (!cards[key]) cards[key] = { name, team, yellow: 0, red: 0 };
            if (ev.display === 'Yellow Card') cards[key].yellow++;
            else cards[key].red++;
        }
    });

    const scorerList = Object.values(scorers).sort((a, b) => b.count - a.count);
    const assistList = Object.values(assists).sort((a, b) => b.count - a.count);
    const cardList = Object.values(cards);

    if (scorerList.length === 0 && assistList.length === 0 && cardList.length === 0) return null;

    return (
        <div className="t-box t-shadow p-3">
            <div className="text-xs font-black uppercase tracking-widest text-muted mb-3">PLAYER STATS</div>
            {scorerList.length > 0 && (
                <div className="mb-3">
                    <div className="text-xs font-black uppercase mb-1" style={{ borderBottom: '2px solid #000', paddingBottom: 4 }}>⚽ SCORERS</div>
                    {scorerList.map((s, i) => (
                        <div key={i} className="flex justify-between text-xs font-bold py-1">
                            <span>{s.name} <span className="text-muted">({s.team})</span>{s.isOG ? ' (OG)' : ''}</span>
                            <span className="font-black">{s.count}</span>
                        </div>
                    ))}
                </div>
            )}
            {assistList.length > 0 && (
                <div className="mb-3">
                    <div className="text-xs font-black uppercase mb-1" style={{ borderBottom: '2px solid #000', paddingBottom: 4 }}>👟 ASSISTS</div>
                    {assistList.map((a, i) => (
                        <div key={i} className="flex justify-between text-xs font-bold py-1">
                            <span>{a.name} <span className="text-muted">({a.team})</span></span>
                            <span className="font-black">{a.count}</span>
                        </div>
                    ))}
                </div>
            )}
            {cardList.length > 0 && (
                <div>
                    <div className="text-xs font-black uppercase mb-1" style={{ borderBottom: '2px solid #000', paddingBottom: 4 }}>🟨 DISCIPLINE</div>
                    {cardList.map((c, i) => (
                        <div key={i} className="flex justify-between text-xs font-bold py-1">
                            <span>{c.name} <span className="text-muted">({c.team})</span></span>
                            <span>{c.yellow > 0 && `🟨${c.yellow}`} {c.red > 0 && `🟥${c.red}`}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PlayerTable;
