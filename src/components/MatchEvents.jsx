import React from 'react';

const MatchEvents = ({ keyEvents, teamAName, teamBName }) => {
    if (!keyEvents || keyEvents.length === 0) {
        return (
            <div className="t-box p-6 text-center">
                <div className="text-[10px] font-black uppercase opacity-30">NO SPECIAL EVENTS RECORDED</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="t-box p-3 bg-white">
                <div className="text-[10px] font-black uppercase mb-4 opacity-50 border-b border-black pb-2">MATCH TIMELINE</div>
                <div className="flex flex-col gap-3">
                    {keyEvents.map((ev, i) => (
                        <div key={i} className="flex items-center gap-4 group">
                            <div className="w-10 text-[12px] font-black text-right tabular-nums">
                                {ev.match_minute}'
                            </div>
                            <div className="flex-none w-8 h-8 flex items-center justify-center bg-gray-light border border-black/10 rounded text-lg">
                                {ev.emoji || '•'}
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-black uppercase tracking-tight">
                                        {ev.display}
                                    </span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${ev.isHome ? 'bg-red' : 'bg-blue'}`}></div>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-[10px] font-bold">
                                        {ev.player_name}
                                    </span>
                                    <span className="text-[9px] font-black opacity-30">
                                        #{ev.jersey_number}
                                    </span>
                                </div>
                            </div>
                            <div className="text-[9px] font-black uppercase opacity-20 group-hover:opacity-100 transition-opacity">
                                {ev.isHome ? teamAName : teamBName}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MatchEvents;
