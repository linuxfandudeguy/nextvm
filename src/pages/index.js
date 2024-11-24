import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Import Next.js Image component
import { GeistMono } from 'next/font/google'; // Import Geist Mono font

// Load the Geist Mono font
const geistMono = GeistMono({ subsets: ['latin'] });

export default function Home() {
  const [output, setOutput] = useState([]); // Array of React elements for output
  const [input, setInput] = useState('');
  const terminalRef = useRef(null);
  const inputRef = useRef(null);

  // ASCII Art to be displayed when terminal loads
  const asciiArt = `
███╗   ██╗███████╗██╗  ██╗████████╗██╗   ██╗███╗   ███╗
████╗  ██║██╔════╝╚██╗██╔╝╚══██╔══╝██║   ██║████╗ ████║
██╔██╗ ██║█████╗   ╚███╔╝    ██║   ██║   ██║██╔████╔██║
██║╚██╗██║██╔══╝   ██╔██╗    ██║   ╚██╗ ██╔╝██║╚██╔╝██║
██║ ╚████║███████╗██╔╝ ██╗   ██║    ╚████╔╝ ██║ ╚═╝ ██║
╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝   ╚═╝     ╚═══╝  ╚═╝     ╚═╝  
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
        styleObj[key] = value;
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

  return (
    <div
      className={`min-h-screen bg-gray-900 text-white flex flex-col ${geistMono.className}`}
      style={{ margin: 0, padding: 0, height: '100vh', width: '100vw' }} // Make the terminal take up the entire screen
    >
      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="bg-gray-800 flex-grow p-6 text-white overflow-auto"
        style={{
          whiteSpace: 'pre', // Ensure whitespace is preserved for ASCII art
          wordWrap: 'normal',
          lineHeight: '1.4',
          scrollBehavior: 'unset', // Ensure no smooth scrolling
        }}
        onScroll={handleScroll} // Detect scrolling
      >
        {output.map((item, index) => (
          <div key={index}>{item}</div> // Dynamically render React elements like Image or text
        ))}
      </div>

      {/* Terminal Input */}
      <div className="bg-gray-800 p-4 flex items-center">
        <span className="text-green-500">root@next:~#</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="bg-transparent text-white p-2 rounded-md focus:outline-none flex-grow"
          autoFocus
          placeholder="Enter a command"
          style={{
            border: 'none',
            backgroundColor: 'transparent', // Make the input blend with terminal background
            fontFamily: 'monospace', // Ensure the input uses a monospace font
          }}
        />
      </div>
    </div>
  );
}
