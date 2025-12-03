module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@web': './src/web',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      // Transform import.meta for Metro compatibility  
      // React Router uses import.meta.hot which is Vite-specific
      require.resolve('./babel-plugin-replace-import-meta.js'),
    ],
  };
};
