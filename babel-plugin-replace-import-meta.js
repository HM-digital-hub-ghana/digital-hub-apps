// Custom Babel plugin to replace import.meta.hot with undefined for Metro compatibility
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
          path.replaceWithSourceString('undefined');
        }
      },
    },
  };
};
