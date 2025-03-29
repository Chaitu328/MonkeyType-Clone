const Session = require('../models/Session');
const calculatePsychologicalInsights  = require('../utils/analysis');

const getSessionAnalysis = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Add debug log to verify function exists
    // console.log('Function check:', {
    //   exists: !!calculatePsychologicalInsights,
    //   type: typeof calculatePsychologicalInsights
    // });

    const insights = calculatePsychologicalInsights(session);
    res.json(insights);

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
};

const getCommonErrors = async (req, res) => {
  // console.log('=== COMMON ERRORS DEBUG ===');
  // console.log('User ID:', req.user._id);
  try {
    // First check if user has any sessions
    const sessionCount = await Session.countDocuments({ user: req.user._id });
    // console.log('User session count:', sessionCount);
    
    if (sessionCount === 0) {
      return res.json({ message: 'No sessions found for analysis' });
    }

    const result = await Session.aggregate([
      { 
        $match: { 
          user: req.user._id,
          "keystrokes": { $exists: true, $not: { $size: 0 } }
        } 
      },
      { $unwind: "$keystrokes" },
      { $match: { "keystrokes.correct": false } },
      { $group: {
        _id: {
          expected: "$keystrokes.char",
          actual: "$keystrokes.typedChar"
        },
        count: { $sum: 1 },
        avgDelay: { $avg: "$keystrokes.latency" },
        examples: { $push: "$keystrokes.surroundingChars" }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: {
        expected: "$_id.expected",
        actual: "$_id.actual",
        count: 1,
        avgDelay: 1,
        exampleContext: { $arrayElemAt: ["$examples", 0] }
      }}
    ]);
    
    // console.log('Aggregation result:', JSON.stringify(result, null, 2));
    res.json(result);
  } catch (error) {
    console.error('Common errors error:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports ={
  getSessionAnalysis,
  getCommonErrors
}