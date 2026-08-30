/** @type {import('@lhci/cli').RcFile} */
module.exports = {
  ci: {
    collect: {
      // Default run; we will override preset from CLI for mobile/desktop
      numberOfRuns: 3,
      startServerCommand: "pnpm start",
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/auth/signup",
        "http://localhost:3000/auth/login",
        "http://localhost:3000/user",
        "http://localhost:3000/pricing",
      ],
    },
    assert: {
      // Scores use 0-1 scale
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 1 }],
        "categories:seo": ["error", { minScore: 1 }],
      },
    },
    upload: {
      // Store reports locally so we can inspect them and feed into CI
      target: "filesystem",
      outputDir: ".lighthouseci",
    },
  },
};
