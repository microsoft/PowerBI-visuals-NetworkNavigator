module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.ts',
      'src/**/*.js',
      'base/**/*.ts',
      'base/**/*.js',
      { pattern: 'src/**/*.spec.ts', ignore: true }
    ],

    tests: [
      'src/**/*.spec.ts'
    ],
    env: {
      type: 'node'
    }
  };
};