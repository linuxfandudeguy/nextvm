import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Import Next.js Image component

export default function Home() {
  const [output, setOutput] = useState([]);
  const [input, setInput] = useState('');
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const [theme, setTheme] = useState(null); // Store the current theme URL
  const themeLinkRef = useRef(null); // Ref to the <link> element for theme styles

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
      setOutput((prevOutput) => [...prevOutput, data.result]); // Just display raw text
    } else {
      setOutput((prevOutput) => [...prevOutput, 'Error: ' + data.error]);
    }

    // Clear input after execution
    setInput('');
    scrollToBottom();
  };

  // Handle the showimage command by rendering the image with optional CSS
  const handleShowImageCommand = (url, cssStyles) => {
    if (url) {
      // Set the image with the passed URL and CSS
      setOutput((prevOutput) => [...prevOutput, `Displaying image from: ${url}`]);

      // Dynamically add the image and pass CSS as inline styles
      setOutput((prevOutput) => [
        ...prevOutput,
        <div style={{ textAlign: 'center', marginTop: '20px' }} key={url}>
          <Image
            src={url}
            alt="Terminal Image"
            width={500} // Specify a width for Next.js Image component
            height={300} // Specify a height
            style={{ maxWidth: '100%', height: 'auto', ...parseCssStyles(cssStyles) }}
          />
        </div>,
      ]);
    } else {
      setOutput((prevOutput) => [...prevOutput, 'Error: Invalid image URL.']);
    }
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

  // Simulate rough scrolling effect in terminal
  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
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

  return (
    <div
      className="min-h-screen bg-gray-900 text-white flex flex-col"
      style={{ margin: 0, padding: 0, height: '100vh', width: '100vw' }} // Make the terminal take up the entire screen
    >
      {/* Terminal Output */}
      <div
        ref={terminalRef}
        className="bg-gray-800 flex-grow p-6 text-white overflow-auto font-mono"
        style={{
          whiteSpace: 'pre', // Ensure whitespace is preserved for ASCII art
          wordWrap: 'normal',
          lineHeight: '1.4',
        }}
      >
        {output.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>

      {/* Terminal Input */}
      <div className="bg-gray-800 p-4 flex items-center">
        <span className="text-green-500">$</span>
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
