import React from 'react';

const MomentumChart = ({ data, teamAName, teamBName }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(1, ...data.map(d => Math.max(d.home, d.away)));

    return (
        <div className="t-box p-3">
            <div className="text-xs font-black uppercase tracking-widest mb-3" style={{ borderBottom: '2px solid #000', paddingBottom: 4 }}>MATCH MOMENTUM</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 80 }}>
                {data.map((d, i) => {
                    const hH = (d.home / maxVal) * 60;
                    const aH = (d.away / maxVal) * 60;
                    return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 60, width: '100%', gap: 1 }}>
                                <div style={{ height: hH, background: 'var(--red)', transition: 'height 0.5s', minHeight: d.home > 0 ? 2 : 0 }}></div>
                                <div style={{ height: aH, background: 'var(--blue)', transition: 'height 0.5s', minHeight: d.away > 0 ? 2 : 0 }}></div>
                            </div>
                            <div className="text-xs text-muted" style={{ fontSize: 7 }}>{d.minute}'</div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-between mt-2 text-xs font-bold">
                <span className="text-red">■ {teamAName}</span>
                <span className="text-blue">■ {teamBName}</span>
            </div>
        </div>
    );
};

export default MomentumChart;
