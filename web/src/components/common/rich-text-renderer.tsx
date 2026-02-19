import React from 'react';

interface Props {
  text: string;
}

const RichTextRenderer = ({ text }: Props) => {
  // checks for http and mentioned
  const COMBINED_REGEX = /(@\w+ \w+|https?:\/\/[^\s]+)/g;
  const processedText = React.useMemo(() => {
    const parts = text.split(COMBINED_REGEX).filter(Boolean);

    return parts.map((part, index) => {
      if (/https?:\/\/[^\s]+/.test(part)) {
        return (
          <a
            key={`link-${index}`}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {part}
          </a>
        );
      }

      if (/^@\w+ \w+$/.test(part)) {
        // Check if it's a mention
        return (
          <span
            key={`mention-${index}`}
            className="bg-blue-100 p-0.5 rounded-sm hover:bg-blue-200 cursor-pointer"
          >
            {part}
          </span>
        );
      }

      return part;
    });
  }, [text]);

  return <>{processedText}</>;
};

export default RichTextRenderer;
