// =========================================
// HELPER: Box to X/Y (12 cols x 8 rows = 96, or 8x4=32)
// Data is always L2R standardized. X is 0-indexed column, Y is 0-indexed row.
// =========================================
export function boxToXY(box, isFutsal = false) {
    if (!box) return { col: 0, row: 0 };
    const rows = isFutsal ? 4 : 8;
    const b = box - 1;
    return { col: Math.floor(b / rows), row: b % rows };
}

// Spatial Helpers (L2R normalized)
export const isInAttackingThird = (locBox, isFutsal) => {
    if (!locBox) return false;
    const { col } = boxToXY(locBox, isFutsal);
    const cols = isFutsal ? 8 : 12;
    return col >= cols - 3;
};

export const isInPenaltyBox = (locBox, isFutsal) => {
    if (!locBox) return false;
    if (isFutsal) {
        return [30, 31].includes(locBox);
    } else {
        return [91, 92, 93, 94, 83, 84, 85, 86].includes(locBox);
    }
};

export const isInDefensiveBox = (locBox, isFutsal) => {
    if (!locBox) return false;
    if (isFutsal) {
        return [2, 3].includes(locBox);
    } else {
        return [3, 4, 5, 6, 11, 12, 13, 14].includes(locBox);
    }
};

export const isInDefensiveThird = (locBox, isFutsal) => {
    if (!locBox) return false;
    if (isFutsal) {
        return locBox <= 12;
    } else {
        return locBox <= 32;
    }
};

export const isProgressive = (startBox, endBox, isFutsal) => {
    if (!startBox || !endBox) return false;
    const startNode = boxToXY(startBox, isFutsal);
    const endNode = boxToXY(endBox, isFutsal);
    // Must move forward by at least 2 columns
    return endNode.col >= startNode.col + 2;
};

// Expected Threat (xT) Base Proxy Matrix (L2R)
export const getXtValue = (box, isFutsal) => {
    if (!box) return 0;
    const { col } = boxToXY(box, isFutsal);
    const cols = isFutsal ? 8 : 12;
    let value = (col / cols) * 0.1; // Base progression
    if (col >= cols - 3) value += 0.2; // Final 3rd bump
    if (isInPenaltyBox(box, isFutsal)) value += 0.5; // Box bump
    return value;
};

// =========================================
// STATS CALCULATOR
// =========================================
export function computeStats(events, match) {
    const init = () => ({
        // 1. Overview
        goals: 0, shots: 0, sot: 0,
        // 2. Passing
        pass_total: 0, pass_success: 0, progressive_passes: 0, key_passes: 0, assists: 0,
        goal_kicks: 0, gk_throws: 0, corners: 0, free_kicks: 0, throw_ins: 0,
        long_balls: 0, passes_in_final_third: 0, passes_in_box: 0,
        // 3. Attacking
        final_third_entries: 0, box_entries: 0, shot_creation_actions: 0, deep_completions: 0,
        shots_inside_box: 0, shots_outside_box: 0, shot_free_kicks: 0, shot_penalties: 0,
        // 4. Dribbling & Carry
        dribbles_attempted: 0, dribble_success: 0,
        dribbles_to_box: 0, dribbles_in_att_third: 0, dribbles_lead_to_shot: 0,
        carries_successful: 0,
        progressive_carries: 0,
        // 5. Defense
        tackles: 0, interceptions: 0, fouls: 0, yellow: 0, red: 0,
        tackles_in_box: 0, tackles_in_def_third: 0,
        interceptions_in_box: 0, interceptions_in_def_third: 0,
        recoveries: 0, recoveries_def_third: 0, recoveries_box: 0,
        defensive_actions: 0, high_press_actions: 0,
        ppda_actions: 0, ppda_passes: 0,
        // 6. Territory
        final_third_passes: 0, attacking_third_actions: 0, box_touches: 0,
        // 7. Possession & Advanced
        chains: 0, chain_events: 0, xt_generated: 0,
        // Base
        events_count: 0, heatmap: {}, corner_goals: 0, fk_goals: 0, penalty_goals: 0, own_goals: 0
    });

    let home = init(), away = init();
    let maxMinute = 0;
    const keyEvents = [];

    // Sequential Tracking Variables
    let currentPossessionTeam = null;
    let currentChainEvents = 0;
    let lastEvent = null;

    const momentumBins = {};

    events.forEach((ev, idx) => {
        const isHome = ev.team_id === match.team_a_id;
        const t = isHome ? home : away;
        const oppT = isHome ? away : home;
        t.events_count++;

        const nextEv = events[idx + 1];

        if (ev.match_minute > maxMinute) maxMinute = ev.match_minute;

        if (ev.location_box) {
            t.heatmap[ev.location_box] = (t.heatmap[ev.location_box] || 0) + 1;
        }

        const { col: startCol, row: startRow } = boxToXY(ev.location_box, match.is_futsal);
        const cols = match.is_futsal ? 8 : 12;
        const inAttacking60 = startCol >= (cols * 0.4); // For PPDA, count actions in opponent's defensive 60%

        // Sequential / Chain Logic (Strict)
        const chainBreakingOutcomes = ['Miss', 'Interception', 'Lost Control', 'Unsuccessful', 'Foul', 'Yellow', 'Red'];
        const breaksChain = chainBreakingOutcomes.includes(ev.outcome) || ev.action === 'Shot';

        if (!currentPossessionTeam) {
            currentPossessionTeam = ev.team_id;
            currentChainEvents = 1;
        } else if (currentPossessionTeam === ev.team_id) {
            currentChainEvents++;
        } else {
            const oldT = currentPossessionTeam === match.team_a_id ? home : away;
            oldT.chains++;
            oldT.chain_events += currentChainEvents;
            currentPossessionTeam = ev.team_id;
            currentChainEvents = 1;
        }

        if (breaksChain) {
            const currentT = currentPossessionTeam === match.team_a_id ? home : away;
            currentT.chains++;
            currentT.chain_events += currentChainEvents;
            currentPossessionTeam = null;
            currentChainEvents = 0;
        }

        // Advanced Base Parsing
        const endBox = ev.end_location_box;
        const startBox = ev.location_box;

        const { col: endCol } = boxToXY(endBox, match.is_futsal);

        const enteredFinalThird = !isInAttackingThird(startBox, match.is_futsal) && isInAttackingThird(endBox, match.is_futsal);
        const enteredPenaltyBox = !isInPenaltyBox(startBox, match.is_futsal) && isInPenaltyBox(endBox, match.is_futsal);
        const isProgressiveAction = isProgressive(startBox, endBox, match.is_futsal);
        const inAttThirdStart = isInAttackingThird(startBox, match.is_futsal);
        const inBoxEnd = isInPenaltyBox(endBox, match.is_futsal);

        if (inAttThirdStart) t.attacking_third_actions++;

        if (isInPenaltyBox(startBox, match.is_futsal) && ['Pass Received', 'Carry', 'Dribble', 'Shot'].includes(ev.action)) {
            t.box_touches++;
        }

        const successOutcomes = ['Successful', 'Goal', 'Assist', 'SoT Save', 'SoT Block', 'Incomplete'];
        const isSuccess = ['Successful', 'Goal', 'Assist', 'SoT Save', 'SoT Block'].includes(ev.outcome);

        const bin = Math.floor((ev.match_minute || 0) / 5) * 5;
        if (!momentumBins[bin]) momentumBins[bin] = { home: 0, away: 0 };
        if (isSuccess) {
            momentumBins[bin][isHome ? 'home' : 'away']++;
        }

        if (isSuccess && startBox && endBox && ['Pass', 'Carry', 'Dribble'].includes(ev.action)) {
            let xtDiff = getXtValue(endBox, match.is_futsal) - getXtValue(startBox, match.is_futsal);
            if (xtDiff > 0) t.xt_generated += xtDiff;
        }

        // Expanded Defensive Actions for PPDA
        const isDefensiveAction = ['Tackle', 'Interception', 'Block', 'Clearance'].includes(ev.action) || ['Yellow', 'Red', 'Foul'].includes(ev.outcome);
        if (isDefensiveAction && inAttacking60) {
            t.ppda_actions++;
        }

        switch (ev.action) {
            case 'Pass':
                t.pass_total++;
                if (ev.type === 'Goalkick') t.goal_kicks++;
                if (ev.type === 'Goalkeeper Throw') t.gk_throws++;
                if (ev.type === 'Corner') t.corners++;
                if (ev.type === 'Free Kick') t.free_kicks++;
                if (ev.type === 'Throw-in') t.throw_ins++;

                if (ev.outcome === 'Successful' || ev.outcome === 'Assist' || ev.outcome === 'Incomplete') {
                    // For PPDA, count opponent passes allowed in their defensive 60%
                    if (!inAttacking60) {
                        oppT.ppda_passes++;
                    }
                }

                if (ev.outcome === 'Successful' || ev.outcome === 'Assist') {
                    t.pass_success++;
                    if (isInAttackingThird(endBox, match.is_futsal)) {
                        t.final_third_passes++;
                        t.passes_in_final_third++;
                    }
                    if (isInPenaltyBox(endBox, match.is_futsal)) {
                        t.passes_in_box++;
                    }
                    
                    const colDiff = endCol - startCol;
                    const longThreshold = match.is_futsal ? 2 : 3;
                    if (colDiff > longThreshold) {
                        t.long_balls++;
                    }

                    if (enteredFinalThird) t.final_third_entries++;
                    if (enteredPenaltyBox) t.box_entries++;
                    if (isProgressiveAction) t.progressive_passes++;
                    if (inBoxEnd && ev.type !== 'Cross') t.deep_completions++;
                }
                if (ev.outcome === 'Assist') {
                    t.assists++;
                    keyEvents.push({ ...ev, display: 'Assist', emoji: '👟', isHome, player_name: ev.player_name, jersey_number: ev.jersey_number });
                }
                if (ev.outcome === 'Interception' || ev.action === 'Interception') {
                    const interceptorTeamId = isHome ? match.team_b_id : match.team_a_id;
                    const interceptorT = isHome ? away : home;
                    interceptorT.interceptions++;
                    interceptorT.defensive_actions++;
                    if (isInDefensiveBox(startBox, match.is_futsal)) interceptorT.interceptions_in_box++;
                    if (isInDefensiveThird(startBox, match.is_futsal)) interceptorT.interceptions_in_def_third++;
                    if (nextEv && nextEv.team_id === interceptorTeamId) {
                        interceptorT.recoveries++;
                        if (isInDefensiveThird(startBox, match.is_futsal)) interceptorT.recoveries_def_third++;
                        if (isInDefensiveBox(startBox, match.is_futsal)) interceptorT.recoveries_box++;
                    }
                    if (inAttThirdStart) interceptorT.high_press_actions++;
                }
                break;
            case 'Shot':
                t.shots++;
                if (['Goal', 'SoT Save', 'SoT Block'].includes(ev.outcome)) t.sot++;
                if (isInPenaltyBox(ev.location_box, match.is_futsal)) {
                    t.shots_inside_box++;
                } else {
                    t.shots_outside_box++;
                }
                if (ev.type === 'Free Kick') t.shot_free_kicks++;
                if (ev.type === 'Penalty') t.shot_penalties++;
                if (lastEvent && lastEvent.team_id === ev.team_id) {
                    t.shot_creation_actions++;
                    if (lastEvent.action === 'Dribble' && lastEvent.outcome === 'Successful') {
                        t.dribbles_lead_to_shot++;
                    }
                }
                if (ev.outcome === 'Goal') {
                    t.goals++;
                    keyEvents.push({ ...ev, display: 'Goal', emoji: '⚽', isHome, player_name: ev.player_name, jersey_number: ev.jersey_number });
                    if (ev.type === 'Corner') t.corner_goals++;
                    if (ev.type === 'Free Kick') t.fk_goals++;
                    if (ev.type === 'Penalty') t.penalty_goals++;
                }
                break;
            case 'Tackle':
            case 'Block':
            case 'Clearance':
                if (ev.action === 'Tackle') t.tackles++;
                t.defensive_actions++;
                if (inAttThirdStart) t.high_press_actions++;
                if (isInDefensiveBox(startBox, match.is_futsal)) t.tackles_in_box++;
                if (isInDefensiveThird(startBox, match.is_futsal)) t.tackles_in_def_third++;
                if (ev.outcome === 'Successful' && nextEv && nextEv.team_id === ev.team_id) {
                    t.recoveries++;
                    if (isInDefensiveThird(startBox, match.is_futsal)) t.recoveries_def_third++;
                    if (isInDefensiveBox(startBox, match.is_futsal)) t.recoveries_box++;
                }
                if (ev.outcome === 'Foul') t.fouls++;
                if (ev.outcome === 'Yellow') {
                    t.yellow++;
                    keyEvents.push({ ...ev, display: 'Yellow Card', emoji: '🟨', isHome, player_name: ev.player_name, jersey_number: ev.jersey_number });
                }
                if (ev.outcome === 'Red') {
                    t.red++;
                    keyEvents.push({ ...ev, display: 'Red Card', emoji: '🟥', isHome, player_name: ev.player_name, jersey_number: ev.jersey_number });
                }
                break;
            case 'Carry':
                if (ev.outcome === 'Successful') {
                    t.carries_successful++;
                    if (enteredFinalThird) t.final_third_entries++;
                    if (enteredPenaltyBox) t.box_entries++;
                    if (isProgressiveAction) t.progressive_carries++;
                }
                break;
            case 'Dribble':
                t.dribbles_attempted++;
                if (ev.outcome === 'Successful') {
                    t.dribble_success++;
                    if (!isInPenaltyBox(startBox, match.is_futsal) && isInPenaltyBox(endBox, match.is_futsal)) {
                        t.dribbles_to_box++;
                    }
                    if (isInAttackingThird(startBox, match.is_futsal) || isInAttackingThird(endBox, match.is_futsal)) {
                        t.dribbles_in_att_third++;
                    }
                    if (enteredFinalThird) t.final_third_entries++;
                    if (enteredPenaltyBox) t.box_entries++;
                }
                break;
            case 'Own Goal':
                t.own_goals++;
                if (isHome) away.goals++;
                else home.goals++;
                keyEvents.push({ ...ev, display: 'Own Goal', emoji: '🔴', isHome, player_name: ev.player_name, jersey_number: ev.jersey_number });
                break;
        }
        lastEvent = ev;
    });

    if (currentPossessionTeam !== null && currentChainEvents > 0) {
        const oldT = currentPossessionTeam === match.team_a_id ? home : away;
        oldT.chains++;
        oldT.chain_events += currentChainEvents;
    }

    keyEvents.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    const momentumData = [];
    for (let i = 0; i <= maxMinute; i += 5) {
        momentumData.push({
            minute: i,
            home: momentumBins[i]?.home || 0,
            away: momentumBins[i]?.away || 0,
        });
    }

    const pct = (n, d) => d === 0 ? 0 : Math.round((n / d) * 100);

    let hProb = 50.0, aProb = 50.0;
    const totalMins = match.is_futsal ? 40 : 90;
    const timePassed = Math.min(maxMinute, totalMins);

    events.forEach(ev => {
        const isHome = ev.team_id === match.team_a_id;
        let shift = 0;
        if (ev.outcome === 'Goal' && ev.action !== 'Own Goal') shift = 10.0;
        else if (ev.action === 'Own Goal') {
            if (isHome) aProb += 10.0, hProb -= 10.0; else hProb += 10.0, aProb -= 10.0;
        } else if (ev.outcome === 'Red') shift = -7.0;
        else if (ev.action === 'Shot') shift = 2.0;
        else if (ev.action === 'Pass' && ev.outcome === 'Successful') shift = isInAttackingThird(ev.location_box, match.is_futsal) ? 0.5 : 0.3;
        else if (['Dribble', 'Carry'].includes(ev.action) && ev.outcome === 'Successful' && isInAttackingThird(ev.location_box, match.is_futsal)) shift = 1.0;

        if (shift !== 0) {
            if (isHome) { hProb += shift; aProb -= shift; }
            else { aProb += shift; hProb -= shift; }
        }
    });

    const diff = home.goals - away.goals;
    if (diff > 0) { hProb += (timePassed * 0.3); aProb -= (timePassed * 0.3); }
    else if (diff < 0) { aProb += (timePassed * 0.3); hProb -= (timePassed * 0.3); }

    hProb = Math.max(1, Math.min(99, Math.round(hProb)));
    aProb = 100 - hProb;

    const ppdaHome = home.ppda_actions === 0 ? 0 : (home.ppda_passes / home.ppda_actions);
    const ppdaAway = away.ppda_actions === 0 ? 0 : (away.ppda_passes / away.ppda_actions);

    const totalFtPasses = home.final_third_passes + away.final_third_passes;
    const fieldTiltHome = pct(home.final_third_passes, totalFtPasses);
    const fieldTiltAway = 100 - fieldTiltHome;

    const totalAttActions = home.attacking_third_actions + away.attacking_third_actions;
    const attThirdHome = pct(home.attacking_third_actions, totalAttActions);
    const attThirdAway = 100 - attThirdHome;

    const homePossLength = home.chains === 0 ? 0 : (home.chain_events / home.chains);
    const awayPossLength = away.chains === 0 ? 0 : (away.chain_events / away.chains);

    const passProxyPossession = (home.pass_total + away.pass_total) === 0 ? 50 : pct(home.pass_total, home.pass_total + away.pass_total);

    return {
        home, away, maxMinute, keyEvents, possession: passProxyPossession,
        passAccHome: pct(home.pass_success, home.pass_total),
        passAccAway: pct(away.pass_success, away.pass_total),
        dribbleAccHome: pct(home.dribble_success, home.dribbles_attempted),
        dribbleAccAway: pct(away.dribble_success, away.dribbles_attempted),
        shotAccHome: pct(home.sot, home.shots),
        shotAccAway: pct(away.sot, away.shots),
        highPressHome: pct(home.high_press_actions, home.defensive_actions),
        highPressAway: pct(away.high_press_actions, away.defensive_actions),
        convRateHome: pct(home.goals, home.shots),
        convRateAway: pct(away.goals, away.shots),
        winProbHome: hProb, winProbAway: aProb,
        isLive: match.status === 'Live',
        ppdaHome: ppdaHome || 0,
        ppdaAway: ppdaAway || 0,
        fieldTiltHome, fieldTiltAway,
        attThirdHome, attThirdAway,
        homePossLength, awayPossLength,
        momentumData
    };
}
