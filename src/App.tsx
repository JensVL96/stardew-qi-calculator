import { FunnelX } from 'lucide-react';
import React, { useState, useMemo } from 'react';

const StardewCropCalculator = () => {
  const [daysLeft, setDaysLeft] = useState(13);
  const [useSpeedGro, setUseSpeedGro] = useState(false);
  const [targetCrops, setTargetCrops] = useState(500);
  const [seedMultiplier, setSeedMultiplier] = useState(2);
  const [customForagingDays, setCustomForagingDays] = useState('');

  const calculations = useMemo(() => {
    const growthTime = useSpeedGro ? 3 : 4;
    const maxForagingDays = Math.max(0, daysLeft - growthTime);
  
    const foragingDays =
      customForagingDays !== ''
        ? Math.min(
            Math.max(1, parseInt(customForagingDays) || 1),
            maxForagingDays
          )
        : maxForagingDays;
  
    const isLimited =
      customForagingDays !== '' && foragingDays < maxForagingDays;
  
    if (foragingDays === 0 || maxForagingDays === 0) {
      return {
        growthTime,
        maxForagingDays,
        foragingDays,
        cycles: [],
        totalMultiplier: 0,
        dailySeedsNeeded: Infinity,
        breakdown: 'Not enough days to complete even one growth cycle!'
      };
    }
  
    let cycles: {
      daysContributing: number;
      multiplier: number;
      contribution: number;
    }[] = [];
  
    let totalMultiplier = 0;
  
    if (!isLimited) {
      // UNLIMITED PYRAMID LOGIC
      let cycleNum = 0;
  
      while (true) {
        const daysContributing =
          foragingDays - cycleNum * growthTime;
  
        if (daysContributing <= 0) break;
  
        const multiplier = Math.pow(seedMultiplier, cycleNum);
        const contribution = daysContributing * multiplier;
  
        cycles.push({
          daysContributing,
          multiplier,
          contribution
        });
  
        totalMultiplier += contribution;
        cycleNum++;
      }
    } else {
      // LIMITED PER DAY LOGIC
      for (let dayIndex = 0; dayIndex < foragingDays; dayIndex++) {
        const plantDay = daysLeft - dayIndex;
    
        let multiplier = 1;
        let remainingDays = plantDay - growthTime;
    
        while (remainingDays > growthTime) {
          multiplier *= seedMultiplier;
          remainingDays -= growthTime;
        }
    
        cycles.push({
          daysContributing: 1,
          multiplier,
          contribution: multiplier
        });
    
        totalMultiplier += multiplier;
      }
    }
  
    const dailySeedsNeeded = targetCrops / totalMultiplier;
  
    const breakdown =
      cycles
        .map(c =>
          c.multiplier === 1
            ? `${c.daysContributing}`
            : `${c.daysContributing}×${c.multiplier}`
        )
        .join(' + ') +
      ` = ${totalMultiplier}`;
  
    return {
      growthTime,
      maxForagingDays,
      foragingDays,
      cycles,
      totalMultiplier,
      dailySeedsNeeded,
      breakdown
    };
  }, [daysLeft, useSpeedGro, targetCrops, seedMultiplier, customForagingDays]);

  const plantingSchedule = useMemo(() => {
    if (calculations.dailySeedsNeeded === Infinity) return [];
    
    const schedule = [];
    const { growthTime, foragingDays } = calculations;
    
    for (let day = daysLeft; day > daysLeft - foragingDays; day--) {
      const harvestDays = [];
      let currentDay = day - growthTime;
      
      while (currentDay > growthTime) {
        harvestDays.push(currentDay);
        currentDay -= growthTime;
      }
      
      if (currentDay >= 1 && currentDay <= growthTime) {
        harvestDays.push(currentDay);
      }
      
      const harvests = harvestDays.length;
      const finalOutput = harvests > 0 ? Math.pow(seedMultiplier, harvests - 1) : 0;
      
      schedule.push({
        plantDay: day,
        harvestDays,
        harvests,
        finalOutput
      });
    }
    
    return schedule;
  }, [daysLeft, calculations, seedMultiplier]);

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #f0fdf4, #d1fae5)',
      padding: '2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    } as React.CSSProperties,
    maxWidth: {
      maxWidth: '1200px',
      margin: '0 auto'
    } as React.CSSProperties,
    card: {
      background: 'white',
      borderRadius: '1rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      padding: '2rem',
      marginBottom: '1.5rem'
    } as React.CSSProperties,
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1.5rem'
    } as React.CSSProperties,
    title: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    } as React.CSSProperties,
    icon: {
      width: '2rem',
      height: '2rem',
      color: '#16a34a'
    } as React.CSSProperties,
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    } as React.CSSProperties,
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    } as React.CSSProperties,
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem'
    } as React.CSSProperties,
    input: {
      width: '100%',
      padding: '0.5rem 1rem',
      border: '2px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      outline: 'none',
      boxSizing: 'border-box'
    } as React.CSSProperties,
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginTop: '0.5rem'
    } as React.CSSProperties,
    checkboxInput: {
      width: '1.25rem',
      height: '1.25rem',
      cursor: 'pointer'
    } as React.CSSProperties,
    resultsCard: {
      background: 'linear-gradient(to right, #f0fdf4, #d1fae5)',
      borderRadius: '0.75rem',
      padding: '1.5rem',
      border: '2px solid #86efac'
    } as React.CSSProperties,
    resultsHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem'
    } as React.CSSProperties,
    resultsTitle: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#1f2937',
      margin: 0
    } as React.CSSProperties,
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    } as React.CSSProperties,
    statCard: {
      background: 'white',
      borderRadius: '0.5rem',
      padding: '1rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    } as React.CSSProperties,
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '0.25rem'
    } as React.CSSProperties,
    statValue: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#15803d'
    } as React.CSSProperties,
    highlightCard: {
      background: 'white',
      borderRadius: '0.5rem',
      padding: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '2px solid #86efac',
      marginBottom: '1rem'
    } as React.CSSProperties,
    highlightValue: {
      fontSize: '1.875rem',
      fontWeight: 'bold',
      color: '#16a34a'
    } as React.CSSProperties,
    table: {
      width: '100%',
      fontSize: '0.875rem',
      borderCollapse: 'collapse'
    } as React.CSSProperties,
    tableHeader: {
      background: '#dcfce7',
      borderBottom: '2px solid #86efac'
    } as React.CSSProperties,
    th: {
      padding: '0.75rem 1rem',
      textAlign: 'left',
      fontWeight: '600'
    } as React.CSSProperties,
    td: {
      padding: '0.75rem 1rem',
      borderBottom: '1px solid #e5e7eb'
    } as React.CSSProperties,
    tableRow: {
      transition: 'background-color 0.2s'
    } as React.CSSProperties,
    infoBox: {
      marginTop: '1rem',
      padding: '1rem',
      background: '#dbeafe',
      borderRadius: '0.5rem',
      border: '1px solid #93c5fd'
    } as React.CSSProperties,
    error: {
      color: '#dc2626',
      fontWeight: '600'
    } as React.CSSProperties,
    helpText: {
      fontSize: '0.75rem',
      color: '#6b7280',
      marginTop: '0.25rem'
    } as React.CSSProperties
  };

  return (
    <div style={styles.container}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={styles.maxWidth}>
          <div style={styles.card}>
            <div style={styles.header}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              style={styles.icon}
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* leaves */}
              <path
                d="M14 4 C10 2, 6 4, 6 8 C10 8, 12 6, 14 4"
                fill="#22c55e"
              />
              <path
                d="M18 4 C22 2, 26 4, 26 8 C22 8, 20 6, 18 4"
                fill="#16a34a"
              />

              {/* fruit body */}
              <circle cx="16" cy="18" r="10" fill="#2563eb" />

              {/* highlights */}
              <circle cx="13" cy="15" r="2" fill="#60a5fa" />
              <circle cx="18" cy="20" r="3" fill="#1d4ed8" />

              {/* outline */}
              <circle
                cx="16"
                cy="18"
                r="10"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="1.5"
              />
            </svg>

              <h1 style={styles.title}>Stardew Valley Qi fruit Quest Calculator</h1>
            </div>
            
            <div style={styles.grid}>
              <div style={styles.inputGroup}>
                <div>
                  <label style={styles.label}>Days Left in Quest</label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={daysLeft}
                    onChange={(e) => setDaysLeft(Math.max(1, parseInt(e.target.value) || 1))}
                    style={styles.input}
                  />
                </div>

                <div style={styles.checkbox}>
                  <input
                    type="checkbox"
                    id="speedgro"
                    checked={useSpeedGro}
                    onChange={(e) => setUseSpeedGro(e.target.checked)}
                    style={styles.checkboxInput}
                  />
                  <label htmlFor="speedgro" style={{...styles.label, marginBottom: 0}}>
                    Using Speed-Gro? (3 days growth instead of 4)
                  </label>
                </div>

                <div>
                  <label style={styles.label}>
                    Limit Foraging Days (optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={calculations.maxForagingDays}
                    value={customForagingDays}
                    onChange={(e) => setCustomForagingDays(e.target.value)}
                    placeholder={`Leave empty for max (${calculations.maxForagingDays})`}
                    style={styles.input}
                  />
                  <div style={styles.helpText}>
                    Only forage seeds for this many days, then rely on seed maker
                  </div>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div>
                  <label style={styles.label}>Target Crops Needed</label>
                  <input
                    type="number"
                    min="1"
                    value={targetCrops}
                    onChange={(e) => setTargetCrops(Math.max(1, parseInt(e.target.value) || 1))}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Seed Maker Multiplier</label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={seedMultiplier}
                    onChange={(e) => setSeedMultiplier(Math.max(1, parseFloat(e.target.value) || 1))}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            <div style={styles.resultsCard}>
              <div style={styles.resultsHeader}>
                <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h2 style={styles.resultsTitle}>Results</h2>
              </div>

              {calculations.dailySeedsNeeded === Infinity ? (
                <div style={styles.error}>{calculations.breakdown}</div>
              ) : (
                <>
                  <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Growth Time</div>
                      <div style={styles.statValue}>{calculations.growthTime} days</div>
                    </div>
                    
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>
                        Foraging Days {customForagingDays !== '' && '(Limited)'}
                      </div>
                      <div style={styles.statValue}>{calculations.foragingDays} days</div>
                      {customForagingDays !== '' && calculations.foragingDays < calculations.maxForagingDays && (
                        <div style={styles.helpText}>Max available: {calculations.maxForagingDays}</div>
                      )}
                    </div>
                    
                    <div style={styles.statCard}>
                      <div style={styles.statLabel}>Total Multiplier</div>
                      <div style={styles.statValue}>{calculations.totalMultiplier.toFixed(2)}</div>
                    </div>
                  </div>

                  <div style={styles.highlightCard}>
                    <div style={styles.statLabel}>Seeds to Forage Per Day</div>
                    <div style={styles.highlightValue}>
                      ≈ {Math.ceil(calculations.dailySeedsNeeded)} seeds/day
                    </div>
                    <div style={{...styles.helpText, marginTop: '0.25rem'}}>
                      (Exact: {calculations.dailySeedsNeeded.toFixed(2)})
                    </div>
                  </div>

                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Calculation Breakdown:</div>
                    <div style={{fontFamily: 'monospace', fontSize: '0.875rem', color: '#4b5563', marginTop: '0.5rem'}}>
                      {calculations.breakdown}
                    </div>
                    <div style={{...styles.helpText, marginTop: '0.5rem'}}>
                      Formula: {targetCrops} ÷ {calculations.totalMultiplier.toFixed(2)} = {calculations.dailySeedsNeeded.toFixed(2)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {calculations.dailySeedsNeeded !== Infinity && plantingSchedule.length > 0 && (
            <div style={styles.card}>
              <h2 style={{...styles.resultsTitle, marginBottom: '1rem'}}>Planting Schedule</h2>
              <div style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem'}}>
                {customForagingDays !== ''
                  ? `Forage ${Math.ceil(calculations.dailySeedsNeeded)} seeds per day for the first ${calculations.foragingDays} days, then rely on seed maker:`
                  : `If you forage ${Math.ceil(calculations.dailySeedsNeeded)} seeds per day, here's what happens:`
                }
              </div>
              
              <div style={{overflowX: 'auto'}}>
                <table style={styles.table}>
                  <thead style={styles.tableHeader}>
                    <tr>
                      <th style={styles.th}>Plant Day</th>
                      <th style={styles.th}>Harvest Days</th>
                      <th style={{...styles.th, textAlign: 'center'}}># Harvests</th>
                      <th style={{...styles.th, textAlign: 'center'}}>Final Output Multiplier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plantingSchedule.map((row, i) => (
                      <tr 
                        key={i} 
                        style={styles.tableRow}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0fdf4'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{...styles.td, fontWeight: '600'}}>Day {row.plantDay}</td>
                        <td style={{...styles.td, color: '#6b7280'}}>
                          {row.harvestDays.join(', ')}
                        </td>
                        <td style={{...styles.td, textAlign: 'center'}}>{row.harvests}</td>
                        <td style={{...styles.td, textAlign: 'center', fontWeight: '600', color: '#15803d'}}>
                          ×{row.finalOutput}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={styles.infoBox}>
                <div style={{fontSize: '0.875rem', color: '#1e40af'}}>
                  <strong>Total expected crops:</strong> {Math.ceil(calculations.dailySeedsNeeded)} seeds/day × {calculations.totalMultiplier.toFixed(2)} multiplier = 
                  <span style={{fontWeight: 'bold', color: '#15803d', marginLeft: '0.25rem'}}>
                    ≈{Math.ceil(calculations.dailySeedsNeeded * calculations.totalMultiplier)} crops
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StardewCropCalculator;