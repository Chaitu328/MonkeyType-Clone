const Joi = require('joi');

const validateSession = (req, res, next) => {
  const schema = Joi.object({
    wpm: Joi.number().min(0).max(300).required(),
    accuracy: Joi.number().min(0).max(100).required(),
    totalErrors: Joi.number().min(0).required(),
    errorWords: Joi.array().items(
      Joi.alternatives().try(
        Joi.string(),
        Joi.object({
          word: Joi.string().required(),
          errorCount: Joi.number().min(1).optional(),
          averageLatency: Joi.number().min(0).optional()
        })
      )
    ),
    typingDurations: Joi.array().items(Joi.number().min(0)),
    keystrokes: Joi.array().items(
      Joi.object({
        char: Joi.string().length(1).required(),
        typedChar: Joi.string().length(1).required(),
        correct: Joi.boolean().required(),
        timestamp: Joi.number().required(),
        latency: Joi.number().min(0).required(),
        surroundingChars: Joi.string().max(5)
      })
    ),
    text: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

module.exports = validateSession;