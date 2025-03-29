const calculatePsychologicalInsights = (session) => {
  // Safely calculate averages with fallbacks
  const avgSpeed = session.typingDurations?.length > 0 
    ? session.typingDurations.reduce((a, b) => a + b, 0) / session.typingDurations.length 
    : 0;

  const totalKeystrokes = session.keystrokes?.length || 1; // Avoid division by zero
  const correctKeystrokes = session.keystrokes?.filter(k => k.correct).length || 0;
  
  const deliberationScore = (correctKeystrokes / totalKeystrokes) * 
                          (1 - ((session.totalErrors || 0) / totalKeystrokes));

  // Cognitive Load Analysis
  const longWordErrors = session.errorWords?.filter(w => w?.length > 8).length || 0;
  const cognitiveLoad = session.errorWords?.length > 0 
    ? longWordErrors / session.errorWords.length 
    : 0;

  // Resilience Analysis
  const postErrorDelays = session.keystrokes?.length > 1
    ? session.keystrokes
        .slice(1) // Skip first keystroke
        .filter((k, i) => !session.keystrokes[i].correct)
        .map(k => k.latency)
    : [];
    
  const avgPostErrorDelay = postErrorDelays.length > 0 
    ? postErrorDelays.reduce((a, b) => a + b, 0) / postErrorDelays.length 
    : 0;

  return {
    impulsivity: 1 - deliberationScore,
    cognitiveLoad,
    resilience: 1 - (avgPostErrorDelay / 1000), // Convert ms to seconds
    metrics: {
      avgSpeed,
      errorRate: (session.totalErrors || 0) / totalKeystrokes,
      errorRecovery: avgPostErrorDelay
    }
  };
};

module.exports = calculatePsychologicalInsights;