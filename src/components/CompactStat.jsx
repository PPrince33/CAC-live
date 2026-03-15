import React from 'react';

const CompactStat = ({ label, homeVal, awayVal }) => {
    return (
        <div className="flex justify-between text-sm font-bold py-1" style={{ borderBottom: '1px solid var(--gray-200)' }}>
            <span className="font-black">{homeVal}</span>
            <span className="text-muted text-xs uppercase tracking-wide">{label}</span>
            <span className="font-black">{awayVal}</span>
        </div>
    );
};

export default CompactStat;
