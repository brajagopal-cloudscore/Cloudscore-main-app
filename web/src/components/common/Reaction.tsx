import * as emoji from "node-emoji";

export default function Reaction({ name }: { name: string }) {
  // Handle Unicode codepoint format (e.g., "U+1f600")
  if (name.startsWith('U+')) {
    try {
      const hexCode = name.substring(2);
      const codePoint = parseInt(hexCode, 16);
      return <span className="text-sm mr-1">{String.fromCodePoint(codePoint)}</span>;
    } catch (error) {
      console.warn('Failed to convert Unicode codepoint:', name);
      return <span className="text-sm mr-1">{emoji.get(name)}</span>;
    }
  }
  
  // Handle standard emoji names
  const emojiChar = emoji.get(name);
  
  // If emoji.get() returns the original string with colons, it means the emoji wasn't found
  if (emojiChar && emojiChar !== `:${name}:`) {
    return <span className="text-sm mr-1">{emojiChar}</span>;
  }

  return (
    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border font-mono">
      :{name}:
    </span>
  );
}
