/** @type {import('react-native-worklets/plugin').PluginOptions} */
const workletsPluginOptions = {
  bundleMode: true,
  strictGlobal: true, // optional, but recommended
}
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: ['transform-remove-console', ['react-native-worklets/plugin', workletsPluginOptions]],
  }
}
