module.exports = {
  "extends": "standard",
  "rules": {
    "max-len": ["warn", 80, {
      "ignoreUrls": true,
      "ignoreTemplateLiterals": true,
      "ignorePattern": "<svg|^import .+ from"
    }],
    "quotes": ["error", "single", {
      "avoidEscape": true
    }],
    "no-console": ["warn", {
      "allow": ["warn", "error"]
    }],
    "no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }]
  }
};
