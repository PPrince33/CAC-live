import React from 'react';

const TugOfWar = ({ label, home, away }) => {
    return (
        <div className="mb-4">
            <div className="flex justify-between mb-1 text-xs font-black uppercase tracking-tight">
                <span className="text-red">{home}%</span>
                <span className="text-muted tracking-widest">{label}</span>
                <span className="text-blue">{away}%</span>
            </div>
            <div className="stat-track">
                <div className="stat-fill-red" style={{ width: `${home}%` }}></div>
                <div className="stat-fill-blue" style={{ width: `${away}%` }}></div>
            </div>
        </div>
    );
};

export default TugOfWar;
