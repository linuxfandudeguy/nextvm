import React, { useEffect, useState } from 'react';

const Ansi = ({ text }) => {
  const [isClient, setIsClient] = useState(false);

  // Use useEffect to determine if we're in the client-side
  useEffect(() => {
    setIsClient(typeof window !== 'undefined');
  }, []);

  // If not client-side (SSR), return plain text
  if (!isClient) {
    return <pre>{text}</pre>;
  }

  // Function to parse the ANSI escape codes and color the text
  const parseAnsi = (str) => {
    const ansiRegex = /\033\[(\d{1,2})m/g;
    const colors = {
      '31': 'red',   // Red
      '32': 'green', // Green
      '33': 'yellow', // Yellow
      '34': 'blue',  // Blue
      '35': 'magenta', // Magenta
      '36': 'cyan',  // Cyan
      '37': 'white', // White
    };

    let parsedText = [];
    let lastIndex = 0;

    let match;
    while ((match = ansiRegex.exec(str)) !== null) {
      const colorCode = match[1];
      const color = colors[colorCode] || 'white';
      const textBeforeMatch = str.slice(lastIndex, match.index);
      parsedText.push(<span key={lastIndex}>{textBeforeMatch}</span>);

      lastIndex = ansiRegex.lastIndex;
      parsedText.push(
        <span key={ansiRegex.lastIndex} style={{ color }}>
          {str.slice(match.index + match[0].length, ansiRegex.lastIndex)}
        </span>
      );
    }

    // Add remaining text after the last match
    parsedText.push(<span key={lastIndex}>{str.slice(lastIndex)}</span>);

    return parsedText;
  };

  // If it's client-side, parse the ANSI codes and return the colored version
  return <pre>{parseAnsi(text)}</pre>;
};

export default Ansi;
