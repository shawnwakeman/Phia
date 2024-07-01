import { Decoration, DecorationSet } from 'prosemirror-view';

export default function (doc) {
    const colorRegex = /(#(?:[0-9a-fA-F]{3}){1,2}\b|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*\d+(\.\d+)?\s*\)|hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)|hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*\d+(\.\d+)?\s*\))/gi;
    const decorations = [];

  doc.descendants((node, position) => {
    if (!node.text) {
      return;
    }

    Array.from(node.text.matchAll(colorRegex)).forEach(match => {
      const color = match[0];
      const index = match.index || 0;
      const from = position + index;
      const to = from + color.length;

      const decoration = Decoration.inline(from, to, {
        class: 'color',
        style: `--color: ${color}`,
      });

      decorations.push(decoration);
    });
  });

  return DecorationSet.create(doc, decorations);
}
