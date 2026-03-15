import React from 'react';
import { boxToXY } from '../utils/stats';

const ShotMap = ({ events, match }) => {
    const shots = events.filter(e => e.action === 'Shot' && e.location_box);
    if (shots.length === 0) return null;
    const isFutsal = match.is_futsal;
    const cols = isFutsal ? 8 : 12;
    const rows = isFutsal ? 4 : 8;
    const vW = 600, vH = isFutsal ? 300 : 400;
    const bW = vW / cols, bH = vH / rows;

    return (
        <div className="t-box t-shadow p-3">
            <div className="text-xs font-black uppercase tracking-widest text-muted mb-3">SHOT MAP</div>
            <div className="pitch-wrap">
                <svg viewBox={`0 0 ${vW} ${vH}`} preserveAspectRatio="xMidYMid meet">
                    <rect x="0" y="0" width={vW} height={vH} fill="#fff" rx="2" stroke="#000" strokeWidth="2" />
                    <line x1={vW / 2} y1="0" x2={vW / 2} y2={vH} stroke="#ddd" strokeWidth="1" />
                    <circle cx={vW / 2} cy={vH / 2} r={isFutsal ? 40 : 55} fill="none" stroke="#ddd" strokeWidth="1" />
                    {shots.map((s, i) => {
                        const { col, row } = boxToXY(s.location_box, isFutsal);
                        const cx = col * bW + bW / 2;
                        const cy = row * bH + bH / 2;
                        const isHome = s.team_id === match.team_a_id;
                        let fill = '#999';
                        if (s.outcome === 'Goal') fill = 'var(--green)';
                        else if (['SoT Save', 'SoT Block'].includes(s.outcome)) fill = isHome ? 'var(--red)' : 'var(--blue)';
                        else fill = '#ccc';
                        return (
                            <g key={i}>
                                <circle cx={cx} cy={cy} r={s.outcome === 'Goal' ? 10 : 7} fill={fill} stroke="#000" strokeWidth="1.5" opacity="0.85" />
                                {s.outcome === 'Goal' && <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill="#fff">G</text>}
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="flex justify-around text-xs font-bold mt-2">
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--green)', border: '1px solid #000', marginRight: 4, verticalAlign: 'middle' }}></span>GOAL</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--red)', border: '1px solid #000', marginRight: 4, verticalAlign: 'middle' }}></span>ON TARGET</span>
                <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#ccc', border: '1px solid #000', marginRight: 4, verticalAlign: 'middle' }}></span>OFF/BLOCKED</span>
            </div>
        </div>
    );
};

export default ShotMap;
