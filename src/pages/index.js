import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'; // Import Next.js Image component

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
      setOutput((prevOutput) => [...prevOutput, <div key={data.result} className="line">{data.result}</div>]); // Just display raw text in a line div
    } else {
      setOutput((prevOutput) => [...prevOutput, <div key={data.error} className="line">Error: {data.error}</div>]);
    }

    setInput('');
    scrollToBottom();
  };

  // Handle the showimage command by rendering the image with optional CSS
  const handleShowImageCommand = (url, cssStyles) => {
    if (url) {
      setOutput((prevOutput) => [
        ...prevOutput,
        <div style={{ textAlign: 'center', marginTop: '20px' }} key={url}>
          <Image
            src={url}
            alt="Terminal Image"
            width={500}
            height={300}
            loader={customImageLoader}
            style={{ maxWidth: '100%', height: 'auto', ...parseCssStyles(cssStyles) }}
          />
        </div>,
      ]);
    } else {
      setOutput((prevOutput) => [...prevOutput, <div key="invalid-url">Error: Invalid image URL.</div>]);
    }
  };

  const customImageLoader = ({ src }) => {
    return src;
  };

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

  // Rough scrolling effect for general mouse wheel scrolling
  useEffect(() => {
    const terminal = terminalRef.current;

    const handleWheel = (event) => {
      event.preventDefault(); // Prevent smooth scrolling

      // Adjust the scroll delta and apply the rough scroll step
      const delta = event.deltaY;
      const step = 30; // Rough scroll step (higher values = rougher)
      const interval = 30; // Milliseconds between steps

      // This will only adjust scrollTop with rough steps, allowing normal scrolling behavior otherwise
      const currentScroll = terminal.scrollTop;

      let remainingScroll = delta;
      const direction = Math.sign(delta);

      // This checks if scrolling is within valid bounds before applying rough scrolling
      if (
        (direction > 0 && currentScroll + remainingScroll < terminal.scrollHeight - terminal.clientHeight) ||
        (direction < 0 && currentScroll + remainingScroll > 0)
      ) {
        let remainingSteps = Math.abs(remainingScroll / step);
        let intervalId = setInterval(() => {
          if (remainingSteps <= 0) {
            clearInterval(intervalId);
          } else {
            terminal.scrollTop += direction * step;
            remainingSteps--;
          }
        }, interval);
      }
    };

    if (terminal) {
      terminal.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (terminal) {
        terminal.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  useEffect(() => {
    setOutput([asciiArt]);
    document.title = 'NextVM'; // Update the title of the page
  }, []);

  return (
    <div
      className="min-h-screen bg-gray-900 text-white flex flex-col"
      style={{ margin: 0, padding: 0, height: '100vh', width: '100vw' }}
    >
      <div
        ref={terminalRef}
        className="bg-gray-800 flex-grow p-6 text-white overflow-auto font-mono"
        style={{
          whiteSpace: 'pre',
          wordWrap: 'normal',
          lineHeight: '1.4',
          scrollSnapType: 'y mandatory', // Enable scroll snap
        }}
      >
        {output.map((item, index) => (
          <div key={index} className="line" style={{ scrollSnapAlign: 'start' }}>
            {item}
          </div>
        ))}
      </div>

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
            backgroundColor: 'transparent',
            fontFamily: 'monospace',
          }}
        />
      </div>
    </div>
  );
}
