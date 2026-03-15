import React from 'react';

const KeyTimeline = ({ keyEvents, match }) => {
    if (keyEvents.length === 0) return <div className="text-xs text-muted uppercase font-bold p-3">No key events yet</div>;
    return (
        <div className="t-box t-shadow p-3">
            <div className="text-xs font-black uppercase tracking-widest text-muted mb-3">KEY EVENTS</div>
            {keyEvents.map((ev, i) => {
                const teamName = ev.isHome ? match.team_a?.name : match.team_b?.name;
                const min = ev.match_minute || Math.floor((ev.timestamp || 0) / 60);
                return (
                    <div key={i} className="timeline-item">
                        <div className="timeline-badge" style={{
                            background: ev.display === 'Goal' ? 'var(--green)' : ev.display === 'Red Card' ? 'var(--red)' : ev.display === 'Yellow Card' ? 'var(--yellow)' : '#eee',
                            color: ['Goal', 'Red Card'].includes(ev.display) ? '#fff' : '#000',
                        }}>
                            {ev.emoji}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="font-black uppercase text-xs">{ev.display}</div>
                            <div className="text-xs text-muted">
                                {teamName} • {min}' {ev.player_name ? `• ${ev.player_name}` : ''} {ev.jersey_number ? `#${ev.jersey_number}` : ''}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default KeyTimeline;
