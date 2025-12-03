/**
 * Web mock for react-native-reanimated
 * Prevents worklets error on web by providing no-op implementations
 */

// Mock all common Reanimated exports with no-op functions
const noop = () => {};
const identity = (value) => value;

// Default export - empty object
module.exports = {};

// Named exports - all no-ops for web
module.exports.useSharedValue = (value) => ({ value });
module.exports.useAnimatedStyle = () => ({});
module.exports.withTiming = identity;
module.exports.withSpring = identity;
module.exports.withRepeat = identity;
module.exports.withSequence = identity;
module.exports.withDelay = identity;
module.exports.cancelAnimation = noop;
module.exports.runOnJS = (fn) => fn;
module.exports.runOnUI = (fn) => fn;
module.exports.useAnimatedReaction = noop;
module.exports.useAnimatedGestureHandler = () => ({});
module.exports.useAnimatedScrollHandler = () => ({});
module.exports.interpolate = identity;
module.exports.useDerivedValue = identity;
module.exports.Easing = {
  linear: identity,
  ease: identity,
  quad: identity,
  cubic: identity,
  poly: identity,
  sin: identity,
  circle: identity,
  exp: identity,
  elastic: identity,
  back: identity,
  bounce: identity,
  bezier: identity,
  in: identity,
  out: identity,
  inOut: identity,
};

// Export default for side-effect imports like: import 'react-native-reanimated';
module.exports.default = module.exports;

