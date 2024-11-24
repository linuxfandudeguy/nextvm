import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Import Next.js Image component

export default function Home() {
  const [output, setOutput] = useState([]); // Array of React elements for output
  const [input, setInput] = useState('');
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // ASCII Art to be displayed when terminal loads
  const asciiArt = `
 ██████   █████                       █████    █████   █████ ██████   ██████
░░██████ ░░███                       ░░███    ░░███   ░░███ ░░██████ ██████ 
 ░███░███ ░███   ██████  █████ █████ ███████   ░███    ░███  ░███░█████░███ 
 ░███░░███░███  ███░░███░░███ ░░███ ░░░███░    ░███    ░███  ░███░░███ ░███ 
 ░███ ░░██████ ░███████  ░░░█████░    ░███     ░░███   ███   ░███ ░░░  ░███ 
 ░███  ░░█████ ░███░░░    ███░░░███   ░███ ███  ░░░█████░    ░███      ░███ 
 █████  ░░█████░░██████  █████ █████  ░░█████     ░░███      █████     █████
░░░░░    ░░░░░  ░░░░░░  ░░░░░ ░░░░░    ░░░░░       ░░░      ░░░░░     ░░░░░ 
`;

  // Function to handle the execution of commands
  const executeCommand = async (command) => {
    // Display the prompt and the command
    setOutput((prevOutput) => [
      ...prevOutput,
      <div key={`prompt-${Date.now()}`}>
        <span className="text-green-500">root@next:~#</span> {command}
      </div>,
    ]);

    // If the command is 'showimage', handle it client-side
    if (command.startsWith('showimage')) {
      const args = command.split(' '); // Split the command into args
      const imageUrl = args[1]; // Image URL should be the second argument
      const cssStyles = args.slice(2).join(' '); // Collect all CSS arguments after the URL

      handleShowImageCommand(imageUrl, cssStyles);
      return; // Prevent further execution through the API
    }

    // If it's not 'showimage', send the command to the API
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    });

    const data = await response.json();

    if (response.ok) {
      setOutput((prevOutput) => [
        ...prevOutput,
        <div key={`result-${Date.now()}`}>{data.result}</div>, // Just display raw text
      ]);
    } else {
      setOutput((prevOutput) => [
        ...prevOutput,
        <div key={`error-${Date.now()}`}>Error: {data.error}</div>,
      ]);
    }

    // Clear input after execution
    setInput('');
    scrollToBottom();
  };

  // Handle the showimage command by rendering the image with optional CSS
  const handleShowImageCommand = (url, cssStyles) => {
    if (url) {
      // Set the image with the passed URL and CSS
      setOutput((prevOutput) => [
        ...prevOutput,
        <div style={{ textAlign: 'center', marginTop: '20px' }} key={url}>
          <Image
            src={url}
            alt="Terminal Image"
            width={500} // Specify a width for Next.js Image component
            height={300} // Specify a height
            loader={customImageLoader} // Use the custom loader
            style={{ maxWidth: '100%', height: 'auto', ...parseCssStyles(cssStyles) }}
          />
        </div>,
      ]);
    } else {
      setOutput((prevOutput) => [
        ...prevOutput,
        <div key="invalid-url">Error: Invalid image URL.</div>,
      ]);
    }
  };

  // Custom image loader function to bypass Next.js's built-in image optimization
  const customImageLoader = ({ src }) => {
    return src; // Simply return the image source URL
  };

  // Function to parse CSS styles from string to an object
  const parseCssStyles = (styles) => {
    const styleObj = {};
    styles.split(';').forEach((style) => {
      const [key, value] = style.split(':').map((s) => s.trim());
      if (key && value) {
        // Convert CSS property to camelCase for React
        const camelCaseKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        styleObj[camelCaseKey] = value;
      }
    });
    return styleObj;
  };

  // Function to scroll to the bottom only if the user is at the bottom
  const scrollToBottom = () => {
    const terminal = terminalRef.current;
    if (terminal) {
      const isAtBottom =
        terminal.scrollHeight - terminal.scrollTop === terminal.clientHeight;

      // If at the bottom, scroll to the bottom
      if (isAtBottom) {
        terminal.scrollTop = terminal.scrollHeight; // Directly set scrollTop to bottom
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      executeCommand(input.trim());
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // When terminal loads, show ASCII Art and update the page title
  useEffect(() => {
    setOutput([asciiArt]);
    scrollToBottom();
    document.title = 'NextVM'; // Update the title of the page
  }, []);

  // Function to detect if user has manually scrolled up
  const handleScroll = () => {
    const terminal = terminalRef.current;
    if (terminal) {
      const isAtBottom =
        terminal.scrollHeight - terminal.scrollTop === terminal.clientHeight;

      // If user scrolls up, don't auto-scroll down
      if (!isAtBottom) {
        terminal.setAttribute('data-scrolling', 'true'); // Mark as manually scrolled up
      } else {
        terminal.setAttribute('data-scrolling', 'false'); // Mark as at the bottom
      }
    }
  };

  // **ANSI RGB Color Parsing Function**
  const parseAnsiToHtml = (text) => {
    const ansiRegex = /\x1b\[([0-9;]+)m/g; // Match ANSI escape codes
    const parts = [];
    let lastIndex = 0;
    let style = {};

    let match;
    while ((match = ansiRegex.exec(text)) !== null) {
      const ansiCode = match[1];
      const index = match.index;

      // Push the text before the ANSI code
      if (lastIndex < index) {
        parts.push(
          <span style={style} key={`text-${lastIndex}`}>
            {text.slice(lastIndex, index)}
          </span>
        );
      }

      lastIndex = ansiRegex.lastIndex; // Update last index to after the ANSI code

      const codeList = ansiCode.split(';').map(Number);

      // Handle foreground RGB color: \x1b[38;2;r;g;b
      if (codeList[0] === 38 && codeList[1] === 2 && codeList.length >= 5) {
        const [_, __, r, g, b] = codeList;
        style = { ...style, color: `rgb(${r}, ${g}, ${b})` };
      }
      // Handle background RGB color: \x1b[48;2;r;g;b
      else if (codeList[0] === 48 && codeList[1] === 2 && codeList.length >= 5) {
        const [_, __, r, g, b] = codeList;
        style = { ...style, backgroundColor: `rgb(${r}, ${g}, ${b})` };
      }
      // Handle 8-bit foreground color (e.g., \x1b[38;5;{colorCode}m)
      else if (codeList[0] === 38 && codeList[1] === 5) {
        const colorCode = codeList[2];
        style = { ...style, color: `rgb(${colorCode}, ${colorCode}, ${colorCode})` };
      }
      // Handle 8-bit background color (e.g., \x1b[48;5;{colorCode}m)
      else if (codeList[0] === 48 && codeList[1] === 5) {
        const colorCode = codeList[2];
        style = { ...style, backgroundColor: `rgb(${colorCode}, ${colorCode}, ${colorCode})` };
      }
    }

    // Push the remaining text after the last match
    if (lastIndex < text.length) {
      parts.push(
        <span style={style} key={`text-${lastIndex}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return parts;
  };

  return (
    <div>
      <div
        ref={terminalRef}
        className="terminal-container"
        style={{ overflowY: 'auto', maxHeight: '80vh' }}
        onScroll={handleScroll}
      >
        {output.map((line, index) => (
          <div key={index}>
            {parseAnsiToHtml(line)}
          </div>
        ))}
      </div>
      <div className="input-area">
        <span className="text-green-500">root@next:~#</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="input-box"
          style={{
            outline: 'none',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'inherit',
            width: 'calc(100% - 120px)',
            fontFamily: 'monospace',
            padding: '10px',
          }}
        />
      </div>
    </div>
  );
}
