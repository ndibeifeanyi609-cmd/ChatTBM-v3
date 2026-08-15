const LEARNING_TYPES = Object.freeze([
  "preference",
  "behavior",
  "pattern",
  "performance",
  "strategy",
  "knowledge"
]);

function isValidLearningType(type) {
  return typeof type === "string" && LEARNING_TYPES.includes(type);
}

module.exports = {
  LEARNING_TYPES,
  isValidLearningType
};
