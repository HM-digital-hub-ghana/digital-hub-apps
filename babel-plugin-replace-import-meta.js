// Custom Babel plugin to replace import.meta.hot with undefined for Metro compatibility
// React Router uses import.meta.hot which is Vite-specific HMR feature
// Since Metro doesn't support this, we replace it with undefined
module.exports = function () {
  return {
    visitor: {
      MemberExpression(path) {
        // Check if this is import.meta.hot or import.meta.anything
        if (
          path.node.object &&
          path.node.object.type === 'MetaProperty' &&
          path.node.object.meta &&
          path.node.object.meta.name === 'import' &&
          path.node.object.property &&
          path.node.object.property.name === 'meta'
        ) {
          // Replace import.meta.hot (or any import.meta.*) with undefined
          // This is safe since Metro doesn't support Vite's HMR anyway
          path.replaceWithSourceString('undefined');
        }
      },
    },
  };
};
