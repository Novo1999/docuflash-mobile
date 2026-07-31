// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { getBundleModeMetroConfig } = require('react-native-worklets/bundleMode')

/** @type {import('expo/metro-config').MetroConfig} */
let config = getDefaultConfig(__dirname)
config = getBundleModeMetroConfig(config)

module.exports = config
