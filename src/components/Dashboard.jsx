import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { computeStats } from '../utils/stats';
import TugOfWar from './TugOfWar';
import CompactStat from './CompactStat';
import MomentumChart from './MomentumChart';
import FilteredHeatmap from './FilteredHeatmap';
import Lineup from './Lineup';
import MatchEvents from './MatchEvents';

const Dashboard = ({ match: initialMatch, onBack }) => {
    const [match, setMatch] = useState(initialMatch);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedHalf, setSelectedHalf] = useState('ALL');
    const [showEndHeatmap, setShowEndHeatmap] = useState(false);

    const fetchEvents = async () => {
        const { data } = await supabase.from('events').select('*')
            .eq('match_id', initialMatch.id)
            .order('timestamp', { ascending: true });
        setEvents(data || []);
        setLoading(false);
    };

    const fetchMatch = async () => {
        const { data } = await supabase.from('matches')
            .select('*, team_a:teams!team_a_id(*), team_b:teams!team_b_id(*)')
            .eq('id', initialMatch.id).single();
        if (data) setMatch(data);
    };

    useEffect(() => {
        fetchEvents();
        fetchMatch();
        const channel = supabase.channel(`dash-${initialMatch.id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: `match_id=eq.${initialMatch.id}` }, fetchEvents)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${initialMatch.id}` }, fetchMatch)
            .subscribe();
        const interval = setInterval(() => { fetchEvents(); fetchMatch(); }, 10000);
        return () => { supabase.removeChannel(channel); clearInterval(interval); };
    }, [initialMatch.id]);

    const stats = useMemo(() => {
        const filtered = events.filter(ev => {
            if (selectedHalf === 'ALL') return true;
            if (selectedHalf === '1ST') return ev.half === '1st';
            if (selectedHalf === '2ND') return ev.half === '2nd';
            return true;
        });
        return computeStats(filtered, match);
    }, [events, match, selectedHalf]);

    if (loading) return <div className="text-xs font-bold animate-pulse uppercase">SYNCHRONIZING FEED...</div>;

    const teamAName = match.team_a?.name || 'Team A';
    const teamBName = match.team_b?.name || 'Team B';
    const scoreA = stats.home.goals;
    const scoreB = stats.away.goals;

    const tabs = ['overview', 'passing', 'attacking', 'dribbling', 'defense', 'advanced', 'heatmap', 'timeline'];

    return (
        <div className="pb-12">
            <div className="flex justify-between items-start mb-4">
                <button className="btn-back" onClick={onBack}>← BACK</button>
                <div className="text-right">
                    <div className="text-xs font-black px-2 py-1 flex items-center gap-1" style={{ background: '#000', color: '#fff' }}>
                        TIME: {stats.maxMinute}'
                        {stats.isLive && <span className="blink" style={{ width: 6, height: 12, display: 'inline-block', background: '#fff' }}></span>}
                    </div>
                    {match.details && <div className="text-ultra-xs font-black text-muted uppercase mt-1 tracking-widest">{match.details.toUpperCase()}</div>}
                    {match.notes && <div className="text-ultra-xs font-black text-muted uppercase mt-0.5 tracking-tight">{match.notes.toUpperCase()}</div>}
                </div>
            </div>

            <div className="t-box t-shadow-lg py-4 mb-6" style={{ background: 'var(--gray-light)' }}>
                <div className="flex justify-between items-center px-4">
                    <div className="flex-1 text-center" style={{ minWidth: 0 }}>
                        {match.team_a?.Logo && <img src={match.team_a.Logo} alt="" className="w-12 h-12 object-contain mx-auto mb-2" />}
                        <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }} className="text-red">{scoreA}</div>
                        <div className="text-xs font-black uppercase tracking-tight mt-2 truncate w-full">{teamAName}</div>
                    </div>
                    <div className="px-3 text-center flex flex-col items-center justify-center">
                        <div className="text-muted" style={{ fontSize: 32, opacity: 0.2, lineHeight: 1 }}>:</div>
                        <div className="text-muted font-bold text-[10px] mt-2 tracking-widest bg-white border border-black px-2 py-0.5" style={{ borderRadius: 2 }}>
                            {stats.isLive ? 'LIVE' : 'FINAL'}
                        </div>
                    </div>
                    <div className="flex-1 text-center" style={{ minWidth: 0 }}>
                        {match.team_b?.Logo && <img src={match.team_b.Logo} alt="" className="w-12 h-12 object-contain mx-auto mb-2" />}
                        <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1 }} className="text-blue">{scoreB}</div>
                        <div className="text-xs font-black uppercase tracking-tight mt-2 truncate w-full">{teamBName}</div>
                    </div>
                </div>
            </div>

            {!stats.isLive && (
                <div className="flex gap-1 mb-4 bg-black p-1" style={{ borderRadius: 4 }}>
                    {['ALL', '1ST', '2ND'].map(sh => (
                        <button
                            key={sh}
                            onClick={() => setSelectedHalf(sh)}
                            className={`flex-1 text-[10px] font-black py-1 px-2 ${selectedHalf === sh ? 'bg-white text-black' : 'text-white'}`}
                            style={{ border: 'none', cursor: 'pointer', transition: '0.2s', borderRadius: 2 }}
                        >
                            {sh === 'ALL' ? 'FULL MATCH' : `${sh} HALF`}
                        </button>
                    ))}
                </div>
            )}

            <div className="tab-bar">
                {tabs.map(tab => (
                    <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div>
                    {stats.isLive && (
                        <div className="t-box t-shadow p-3 mb-4 text-center">
                            <div className="text-xs font-black uppercase mb-2">WIN PROBABILITY</div>
                            <div className="flex justify-between items-center text-sm font-black mx-4">
                                <span className="text-red">{stats.winProbHome}%</span>
                                <div className="stat-track flex-1 mx-4">
                                    <div className="stat-fill-red" style={{ width: `${stats.winProbHome}%` }}></div>
                                    <div className="stat-fill-blue" style={{ width: `${stats.winProbAway}%` }}></div>
                                </div>
                                <span className="text-blue">{stats.winProbAway}%</span>
                            </div>
                        </div>
                    )}

                    <div className="t-box p-3 mb-4">
                        <div className="text-xs font-black uppercase mb-3" style={{ borderBottom: '2px solid #000', paddingBottom: 4 }}>KEY PERFORMANCE</div>
                        <TugOfWar label="POSSESSION" home={stats.possession} away={100 - stats.possession} />
                        <TugOfWar label="FIELD TILT" home={stats.fieldTiltHome} away={stats.fieldTiltAway} />
                        <CompactStat label="TOTAL SHOTS" homeVal={stats.home.shots} awayVal={stats.away.shots} />
                        <CompactStat label="PASSES SUCCESSFUL" homeVal={stats.home.pass_success} awayVal={stats.away.pass_success} />
                        <CompactStat label="TACKLES & INT" homeVal={stats.home.tackles + stats.home.interceptions} awayVal={stats.away.tackles + stats.away.interceptions} />
                        <CompactStat label="PPDA" 
                            homeVal={stats.ppdaHome > 0 ? stats.ppdaHome.toFixed(1) : '-'} 
                            awayVal={stats.ppdaAway > 0 ? stats.ppdaAway.toFixed(1) : '-'} 
                        />
                        <CompactStat label="CARDS (Y/R)" homeVal={`${stats.home.yellow}/${stats.home.red}`} awayVal={`${stats.away.yellow}/${stats.away.red}`} />
                    </div>

                    <div className="mb-6">
                        <MomentumChart data={stats.momentumData} teamAName={teamAName} teamBName={teamBName} />
                    </div>

                    <Lineup matchId={match.id} teamAId={match.team_a_id} teamBId={match.team_b_id} teamAName={teamAName} teamBName={teamBName} />
                </div>
            )}

            {activeTab === 'passing' && (
                <div>
                    <div className="t-box p-3 mb-4">
                        <div className="text-xs font-black uppercase mb-3" style={{ borderBottom: '2px solid #000', paddingBottom: 4 }}>PASSING SUMMARY</div>
                        <CompactStat label="TOTAL PASS (SUCCESSFUL)" homeVal={`${stats.home.pass_total} (${stats.home.pass_success})`} awayVal={`${stats.away.pass_total} (${stats.away.pass_success})`} />
                        <CompactStat label="PASS ACCURACY %" homeVal={`${stats.passAccHome}%`} awayVal={`${stats.passAccAway}%`} />
                        <CompactStat label="KEY PASSES" homeVal={stats.home.key_passes || 0} awayVal={stats.away.key_passes || 0} />
                        <CompactStat label="PROG. PASSES" homeVal={stats.home.progressive_passes} awayVal={stats.away.progressive_passes} />
                        <CompactStat label="ASSISTS" homeVal={stats.home.assists} awayVal={stats.away.assists} />
                        <CompactStat label="FINAL THIRD ENTRIES" homeVal={stats.home.final_third_entries} awayVal={stats.away.final_third_entries} />
                        <CompactStat label="PENALTY BOX ENTRIES" homeVal={stats.home.box_entries} awayVal={stats.away.box_entries} />
                        <CompactStat label="DEEP COMPLETIONS" homeVal={stats.home.deep_completions} awayVal={stats.away.deep_completions} />
                        <CompactStat label="PASSES IN ATTACK 3RD" homeVal={stats.home.final_third_passes} awayVal={stats.away.final_third_passes} />
                    </div>
                </div>
            )}

            {activeTab === 'attacking' && (
                <div>
                    <div className="t-box p-3 mb-4">
                        <div className="text-xs font-black uppercase mb-3" style={{ borderBottom: '2px solid #000', paddingBottom: 4 }}>ATTACKING PERFORMANCE</div>
                        <CompactStat label="TOTAL SHOT" homeVal={stats.home.shots} awayVal={stats.away.shots} />
                        <CompactStat label="SHOT ON TARGET" homeVal={stats.home.sot} awayVal={stats.away.sot} />
                        <CompactStat label="SHOTS INSIDE BOX" homeVal={stats.home.shots_inside_box} awayVal={stats.away.shots_inside_box} />
                        <CompactStat label="SHOTS OUTSIDE BOX" homeVal={stats.home.shots_outside_box} awayVal={stats.away.shots_outside_box} />
                        <CompactStat label="SHOT CREATION ACTIONS" homeVal={stats.home.shot_creation_actions} awayVal={stats.away.shot_creation_actions} />
                        <CompactStat label="CONVERSION RATE" homeVal={`${stats.convRateHome}%`} awayVal={`${stats.convRateAway}%`} />
                    </div>
                </div>
            )}

            {activeTab === 'dribbling' && (
                <div>
                    <div className="t-box p-3 mb-4">
                        <div className="text-xs font-black uppercase mb-3" style={{ borderBottom: '2px solid #000', paddingBottom: 4 }}>DRIBBLING & CARRIES</div>
                        <CompactStat label="TOTAL DRIB (SUCCESS)" homeVal={`${stats.home.dribbles_attempted} (${stats.home.dribble_success})`} awayVal={`${stats.away.dribbles_attempted} (${stats.away.dribble_success})`} />
                        <CompactStat label="DRIBBLE ACCURACY %" homeVal={`${stats.dribbleAccHome}%`} awayVal={`${stats.dribbleAccAway}%`} />
                        <CompactStat label="SUCCESS DRIBBLES TO BOX" homeVal={stats.home.dribbles_to_box} awayVal={stats.away.dribbles_to_box} />
                        <CompactStat label="SUCCESS DRIBBLES IN ATT 3RD" homeVal={stats.home.dribbles_in_att_third} awayVal={stats.away.dribbles_in_att_third} />
                        <CompactStat label="PROGRESSIVE CARRIES" homeVal={stats.home.progressive_carries} awayVal={stats.away.progressive_carries} />
                    </div>
                </div>
            )}

            {activeTab === 'defense' && (
                <div>
                    <div className="t-box p-3 mb-4">
                        <div className="text-xs font-black uppercase mb-3" style={{ borderBottom: '2px solid #000', paddingBottom: 4 }}>DEFENSIVE ACTIONS</div>
                        <CompactStat label="TOTAL DEF ACTIONS" homeVal={stats.home.defensive_actions} awayVal={stats.away.defensive_actions} />
                        <CompactStat label="TACKLES" homeVal={stats.home.tackles} awayVal={stats.away.tackles} />
                        <CompactStat label="PASS INTERCEPTIONS" homeVal={stats.home.interceptions} awayVal={stats.away.interceptions} />
                        <CompactStat label="RECOVERIES" homeVal={stats.home.recoveries_interception + stats.home.recoveries_tackle} awayVal={stats.away.recoveries_interception + stats.away.recoveries_tackle} />
                        <CompactStat label="HIGH PRESS ACTIONS" homeVal={stats.home.high_press_actions} awayVal={stats.away.high_press_actions} />
                        <CompactStat label="FOULS" homeVal={stats.home.fouls} awayVal={stats.away.fouls} />
                    </div>
                </div>
            )}

            {activeTab === 'advanced' && (
                <div>
                    <div className="t-box p-3 mb-4">
                        <div className="text-xs font-black uppercase mb-3" style={{ borderBottom: '2px solid #000', paddingBottom: 4 }}>POSSESSION & ADVANCED</div>
                        <CompactStat label="POSSESSION CHAINS" homeVal={stats.home.chains} awayVal={stats.away.chains} />
                        <CompactStat label="AVG POSS. LENGTH" homeVal={stats.homePossLength.toFixed(1)} awayVal={stats.awayPossLength.toFixed(1)} />
                        <CompactStat label="ATTACKING 3RD ACTIONS" homeVal={stats.home.attacking_third_actions} awayVal={stats.away.attacking_third_actions} />
                        <CompactStat label="BOX TOUCHES" homeVal={stats.home.box_touches} awayVal={stats.away.box_touches} />
                        <CompactStat label="xT GENERATED" homeVal={stats.home.xt_generated.toFixed(2)} awayVal={stats.away.xt_generated.toFixed(2)} />
                        <CompactStat label="FIELD TILT %" homeVal={`${stats.fieldTiltHome}%`} awayVal={`${stats.fieldTiltAway}%`} />
                    </div>
                </div>
            )}

            {activeTab === 'heatmap' && (
                <div>
                    <div className="flex gap-2 mb-4">
                        <button
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest border-2 border-black ${!showEndHeatmap ? 'bg-black text-white' : 'bg-white text-black'}`}
                            onClick={() => setShowEndHeatmap(false)}
                        >
                            Start Locations
                        </button>
                        <button
                            className={`flex-1 py-2 text-xs font-black uppercase tracking-widest border-2 border-black ${showEndHeatmap ? 'bg-black text-white' : 'bg-white text-black'}`}
                            onClick={() => setShowEndHeatmap(true)}
                        >
                            End Locations
                        </button>
                    </div>

                    <FilteredHeatmap events={events} match={match} teamId={match.team_a_id} teamName={teamAName} color="var(--red)" isEndLocation={showEndHeatmap} />
                    <FilteredHeatmap events={events} match={match} teamId={match.team_b_id} teamName={teamBName} color="var(--blue)" isEndLocation={showEndHeatmap} />
                </div>
            )}

            {activeTab === 'timeline' && (
                <MatchEvents keyEvents={stats.keyEvents} teamAName={teamAName} teamBName={teamBName} />
            )}
        </div>
    );
};

export default Dashboard;
