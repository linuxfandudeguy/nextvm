import React from 'react';

// Function to parse ANSI escape sequences and return colored text
const parseAnsi = (input) => {
  const ansiRegex = /\033\[(\d+)(m)/g; // Regex to find ANSI codes
  const colorMap = {
    '30': 'black',
    '31': 'red',
    '32': 'green',
    '33': 'yellow',
    '34': 'blue',
    '35': 'magenta',
    '36': 'cyan',
    '37': 'white',
    '90': 'brightBlack',
    '91': 'brightRed',
    '92': 'brightGreen',
    '93': 'brightYellow',
    '94': 'brightBlue',
    '95': 'brightMagenta',
    '96': 'brightCyan',
    '97': 'brightWhite',
  };

  // Replace ANSI escape codes with corresponding HTML style spans
  return input.split('').map((char, index) => {
    if (ansiRegex.test(char)) {
      const matches = ansiRegex.exec(char);
      const colorCode = matches[1];
      const color = colorMap[colorCode];
      return <span key={index} style={{ color }}>{char}</span>;
    }
    return char;
  });
};

export default function Ansi({ text }) {
  return <pre>{parseAnsi(text)}</pre>;
}
