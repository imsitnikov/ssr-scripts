export const overrideWebpackRules = (rules, patch) => {
  return rules.map(ruleToPatch => {
    let rule = patch(ruleToPatch);
    if (rule.rules) {
      rule = { ...rule, rules: overrideWebpackRules(rule.rules, patch) };
    }
    if (rule.oneOf) {
      rule = { ...rule, oneOf: overrideWebpackRules(rule.oneOf, patch) };
    }
    return rule;
  });
};
