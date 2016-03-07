module.exports = function (wallaby) {
  return {
    files: [
      'visuals/**/*.ts',
      'base/**/*.ts',
      { pattern: 'visuals/**/*.spec.ts', ignore: true }
    ],

    tests: [
      'visuals/**/*.spec.ts'
    ],
    env: {
      type: 'node'
    }
  };
};