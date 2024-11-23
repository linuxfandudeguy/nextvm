import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [output, setOutput] = useState('');
  const [input, setInput] = useState('');
  const terminalRef = useRef(null);
  const inputRef = useRef(null);
  const [theme, setTheme] = useState(null); // Store the current theme URL

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
    // If the command is 'nextvm', handle it client-side
    if (command.startsWith('nextvm')) {
      const url = command.split(' ')[1]; // Get the URL from the command
      handleNextVMCommand(url); // Call the client-side logic
      return; // Prevent further execution through the API
    }

    // If it's not 'nextvm', send the command to the API
    const response = await fetch('/api/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    });

    const data = await response.json();

    if (response.ok) {
      setOutput((prevOutput) => prevOutput + '\n' + data.result); // Just display raw text
    } else {
      setOutput((prevOutput) => prevOutput + '\nError: ' + data.error);
    }

    // Clear input after execution
    setInput('');
    scrollToBottom();
  };

  // Handle the nextvm command by changing the terminal theme
  const handleNextVMCommand = (url) => {
    if (url) {
      setTheme(url); // Update theme based on the URL provided in the command
      setOutput((prevOutput) => prevOutput + `\n[Terminal theme changed to: ${url}]`);
    } else {
      setOutput((prevOutput) => prevOutput + '\nError: Invalid theme URL.');
    }
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
    setOutput(asciiArt);
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
        <pre>{output}</pre> {/* Render raw text output */}
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
