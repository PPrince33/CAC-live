import React from 'react';

const CompactStat = ({ label, homeVal, awayVal, trend = 'higher' }) => {
    // Helper to extract number for comparison
    const parse = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        const match = val.toString().match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
    };

    const h = parse(homeVal);
    const a = parse(awayVal);
    
    let highlightHome = false;
    let highlightAway = false;

    if (trend !== 'neutral') {
        if (trend === 'higher') {
            if (h > a) highlightHome = true;
            else if (a > h) highlightAway = true;
        } else if (trend === 'lower') {
            // Only highlight if it's not 0 or both aren't 0
            if (h > 0 || a > 0) {
                if (h < a) highlightHome = true;
                else if (a < h) highlightAway = true;
            }
        }
    }

    const highlightStyle = {
        border: '2px solid var(--yellow)',
        borderRadius: '50%',
        padding: '0 4px',
        minWidth: '24px',
        textAlign: 'center',
        display: 'inline-block'
    };

    return (
        <div className="flex justify-between items-center text-sm font-bold py-1" style={{ borderBottom: '1px solid var(--gray-200)' }}>
            <span className="font-black" style={highlightHome ? highlightStyle : {}}>{homeVal}</span>
            <span className="text-muted text-xs uppercase tracking-wide px-2 text-center" style={{ flex: 1 }}>{label}</span>
            <span className="font-black" style={highlightAway ? highlightStyle : {}}>{awayVal}</span>
        </div>
    );
};

export default CompactStat;
