module.exports = {
  ci: {
    collect: {
      staticDistDir: 'front/dist',
      numberOfRuns: 3,
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
