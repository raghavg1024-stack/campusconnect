// Apply the requested style restrictions to framework-generated CSS as well.
module.exports = () => ({
  postcssPlugin: 'campus-style-cleanup',
  OnceExit(root) {
    root.walkAtRules('media', rule => rule.remove());
    root.walkDecls(decl => {
      if (/^(font(?:-family|-weight|-style|-variant|-feature-settings|-variation-settings)?|line-height|(?:row-|column-)?gap|white-space|object-fit)$/.test(decl.prop) || decl.prop.startsWith('--font-') || decl.prop === 'flex' && /^1(?:\s|$)/.test(decl.value.trim()) || decl.prop === 'flex-grow' && decl.value.trim() === '1') decl.remove();
      else if (decl.prop === 'max-width') {
        decl.prop = 'width';
        decl.value = decl.value === 'none' ? 'auto' : `min(100%, ${decl.value})`;
      }
    });
  },
});
module.exports.postcss = true;
