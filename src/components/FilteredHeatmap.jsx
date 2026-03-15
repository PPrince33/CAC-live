import React, { useState } from 'react';
import { boxToXY } from '../utils/stats';

const FilteredHeatmap = ({ events, match, teamId, teamName, color, isEndLocation = false }) => {
    const [filterAction, setFilterAction] = useState('Pass');
    const [filterType, setFilterType] = useState('ALL');
    const [filterOutcome, setFilterOutcome] = useState('Successful');

    const isFutsal = match.is_futsal;
    const cols = isFutsal ? 8 : 12;
    const rows = isFutsal ? 4 : 8;
    const totalBoxes = cols * rows;
    const vW = 600, vH = isFutsal ? 300 : 400;
    const bW = vW / cols, bH = vH / rows;

    const actions = [...new Set(events.map(e => e.action))].filter(Boolean);
    const availableTypes = [...new Set(events.filter(e => e.action === filterAction).map(e => e.type))].filter(Boolean);
    const availableOutcomes = [...new Set(events.filter(e => e.action === filterAction && (filterType === 'ALL' || e.type === filterType)).map(e => e.outcome))].filter(Boolean);

    const filteredEvents = events.filter(e => {
        if (e.team_id !== teamId) return false;
        const loc = isEndLocation ? e.end_location_box : e.location_box;
        if (!loc) return false;
        if (e.action !== filterAction) return false;
        if (filterType !== 'ALL' && e.type !== filterType) return false;
        if (filterOutcome !== 'ALL' && e.outcome !== filterOutcome) return false;
        return true;
    });

    const counts = {};
    filteredEvents.forEach(e => {
        const loc = isEndLocation ? e.end_location_box : e.location_box;
        counts[loc] = (counts[loc] || 0) + 1;
    });
    const maxCount = Math.max(1, ...Object.values(counts));

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
                <div className="text-xs font-black uppercase tracking-tight" style={{ color }}>{teamName} ({isEndLocation ? 'END' : 'START'})</div>
                <div className="text-[10px] font-black bg-black text-white px-2 py-0.5" style={{ borderRadius: 2 }}>COUNT: {filteredEvents.length}</div>
            </div>

            <div className="flex flex-wrap gap-1 mb-3 bg-gray-100 p-1" style={{ border: '1px solid #000' }}>
                <select value={filterAction} onChange={e => { setFilterAction(e.target.value); setFilterType('ALL'); setFilterOutcome('ALL'); }} className="h-map-select">
                    {actions.map(a => <option key={a} value={a}>{a.toUpperCase()}</option>)}
                </select>
                <select value={filterType} onChange={e => { setFilterType(e.target.value); setFilterOutcome('ALL'); }} className="h-map-select">
                    <option value="ALL">ALL TYPES</option>
                    {availableTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                </select>
                <select value={filterOutcome} onChange={e => setFilterOutcome(e.target.value)} className="h-map-select">
                    <option value="ALL">ALL OUTCOMES</option>
                    {availableOutcomes.map(o => <option key={o} value={o}>{o.toUpperCase()}</option>)}
                </select>
            </div>

            <div className="pitch-wrap" style={{ position: 'relative' }}>
                <svg viewBox={`0 0 ${vW} ${vH}`} preserveAspectRatio="xMidYMid meet">
                    <rect x="0" y="0" width={vW} height={vH} fill="#fff" stroke="#000" strokeWidth="2" />
                    {Array.from({ length: totalBoxes }, (_, i) => {
                        const box = i + 1;
                        const { col, row } = boxToXY(box, isFutsal);
                        const count = counts[box] || 0;
                        const intensity = count / maxCount;
                        return (
                            <g key={box}>
                                <rect x={col * bW} y={row * bH} width={bW} height={bH}
                                    fill={count > 0 ? color : 'transparent'}
                                    opacity={count > 0 ? 0.1 + intensity * 0.75 : 0}
                                    stroke="#eee" strokeWidth="0.5" />
                                {count > 0 && (
                                    <text x={col * bW + bW / 2} y={row * bH + bH / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="900" fill={intensity > 0.5 ? '#fff' : '#000'} opacity="0.9">
                                        {count}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                    <line x1={vW / 2} y1="0" x2={vW / 2} y2={vH} stroke="#000" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
                    <circle cx={vW / 2} cy={vH / 2} r={isFutsal ? 40 : 55} fill="none" stroke="#000" strokeWidth="1" strokeDasharray="4" opacity="0.3" />
                    <rect x="0" y={vH * 0.25} width={vW * 0.15} height={vH * 0.5} fill="none" stroke="#000" strokeWidth="1" opacity="0.3" />
                    <rect x={vW * 0.85} y={vH * 0.25} width={vW * 0.15} height={vH * 0.5} fill="none" stroke="#000" strokeWidth="1" opacity="0.3" />
                </svg>
            </div>
        </div>
    );
};

export default FilteredHeatmap;
