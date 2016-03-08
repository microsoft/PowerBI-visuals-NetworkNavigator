module.exports = function (wallaby) {
  return {
    files: [
      'visuals/**/*.ts',
      'visuals/**/*.js',
      'base/**/*.ts',
      'base/**/*.js',
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