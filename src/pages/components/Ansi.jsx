import React from 'react';

// Function to parse and replace ANSI escape codes with HTML (including RGB)
const parseAnsiToHtml = (input) => {
  if (typeof window === 'undefined') return input; // Prevent execution on the server

  // Regex for basic color codes
  const ansiRegex = /\x1b\[(\d+)(;\d+)*m/g;
  // Regex for RGB codes (foreground: 38;2;R;G;B and background: 48;2;R;G;B)
  const rgbRegex = /\x1b\[(38|48);2;(\d+);(\d+);(\d+)m/g;

  // Replace RGB codes with span tags and inline styles
  input = input.replace(rgbRegex, (match, type, r, g, b) => {
    const color = `rgb(${r}, ${g}, ${b})`;
    return `<span style="${type === '38' ? `color: ${color};` : `background-color: ${color};`}">`;
  });

  // Replace basic ANSI codes with HTML span tags (for colors like 30-37 for foreground and 40-47 for background)
  const colorMap = {
    '30': 'color: black;',
    '31': 'color: red;',
    '32': 'color: green;',
    '33': 'color: yellow;',
    '34': 'color: blue;',
    '35': 'color: magenta;',
    '36': 'color: cyan;',
    '37': 'color: white;',
    '39': 'color: inherit;', // reset color
    '40': 'background-color: black;',
    '41': 'background-color: red;',
    '42': 'background-color: green;',
    '43': 'background-color: yellow;',
    '44': 'background-color: blue;',
    '45': 'background-color: magenta;',
    '46': 'background-color: cyan;',
    '47': 'background-color: white;',
  };

  input = input.replace(ansiRegex, (match, p1) => {
    const style = colorMap[p1];
    if (style) {
      return `<span style="${style}">`;
    }
    return match; // Return the match as-is if no corresponding style is found
  }).replace(/\x1b\[0m/g, '</span>'); // Reset all styles

  return input;
};

// Ansi component to display text with parsed ANSI codes
const Ansi = ({ text }) => {
  const htmlContent = parseAnsiToHtml(text);
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
};

export default Ansi;
