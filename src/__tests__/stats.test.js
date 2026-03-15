import { describe, it, expect } from 'vitest';
import { computeStats } from '../utils/stats';

describe('computeStats logic verification', () => {
    const mockMatch = {
        id: 'match-1',
        team_a_id: 'team-home',
        team_b_id: 'team-away',
        is_futsal: false,
        status: 'Live'
    };

    it('should correctly calculate goals from events', () => {
        const events = [
            { team_id: 'team-home', action: 'Shot', outcome: 'Goal', match_minute: 10, timestamp: 600 },
            { team_id: 'team-away', action: 'Shot', outcome: 'Goal', match_minute: 20, timestamp: 1200 },
            { team_id: 'team-home', action: 'Shot', outcome: 'Goal', match_minute: 30, timestamp: 1800 }
        ];

        const stats = computeStats(events, mockMatch);
        expect(stats.home.goals).toBe(2);
        expect(stats.away.goals).toBe(1);
    });

    it('should handle own goals correctly', () => {
        const events = [
            { team_id: 'team-home', action: 'Own Goal', match_minute: 5, timestamp: 300 }
        ];

        const stats = computeStats(events, mockMatch);
        expect(stats.home.own_goals).toBe(1);
        expect(stats.away.goals).toBe(1); // Own goal by home team counts for away team
    });

    it('should calculate passing accuracy correctly', () => {
        const events = [
            { team_id: 'team-home', action: 'Pass', outcome: 'Successful' },
            { team_id: 'team-home', action: 'Pass', outcome: 'Successful' },
            { team_id: 'team-home', action: 'Pass', outcome: 'Interception' } // Inaccurate
        ];

        const stats = computeStats(events, mockMatch);
        expect(stats.home.pass_total).toBe(3);
        expect(stats.home.pass_success).toBe(2);
        expect(stats.passAccHome).toBe(67); // 2/3 * 100 round to 67
    });

    it('should calculate win probability accurately based on score', () => {
        const events = [
            { team_id: 'team-home', action: 'Shot', outcome: 'Goal', match_minute: 80, timestamp: 4800 }
        ];
        // Score is 1-0 for home team at 80 mins
        const stats = computeStats(events, mockMatch);
        expect(stats.winProbHome).toBeGreaterThan(50);
    });

    it('should calculate xT (Expected Threat) for progressive actions', () => {
        const events = [
            { 
                team_id: 'team-home', 
                action: 'Pass', 
                outcome: 'Successful', 
                location_box: 1, // Start column 0
                end_location_box: 93 // In penalty box (High xT)
            }
        ];
        const stats = computeStats(events, mockMatch);
        expect(stats.home.xt_generated).toBeGreaterThan(0);
    });
});
