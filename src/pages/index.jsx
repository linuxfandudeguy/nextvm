import { useState, useRef, useEffect } from 'react';
import Ansi from './components/Ansi'; // Import the Ansi component

export default function Home() {
  const asciiArt = `
███▄▄▄▄      ▄████████ ▀████    ▐████▀     ███      ▄█    █▄    ▄▄▄▄███▄▄▄▄  
███▀▀▀██▄   ███    ███   ███▌   ████▀  ▀█████████▄ ███    ███ ▄██▀▀▀███▀▀▀██▄
███   ███   ███    █▀     ███  ▐███       ▀███▀▀██ ███    ███ ███   ███   ███
███   ███  ▄███▄▄▄        ▀███▄███▀        ███   ▀ ███    ███ ███   ███   ███
███   ███ ▀▀███▀▀▀        ████▀██▄         ███     ███    ███ ███   ███   ███
███   ███   ███    █▄    ▐███  ▀███        ███     ███    ███ ███   ███   ███
███   ███   ███    ███  ▄███     ███▄      ███     ███    ███ ███   ███   ███
 ▀█   █▀    ██████████ ████       ███▄    ▄████▀    ▀██████▀   ▀█   ███   █▀ `;

  const [tabs, setTabs] = useState([{ id: 1, output: [asciiArt], input: '' }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const terminalRef = useRef(null);

  // Get the active tab
  const getActiveTab = () => tabs.find((tab) => tab.id === activeTabId);

  // Execute commands and handle API response
  const executeCommand = async (command) => {
    const activeTab = getActiveTab();

    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId
          ? {
              ...tab,
              output: [
                ...tab.output,
                <div key={`prompt-${Date.now()}`}>
                  <span className="text-green-500">root@next:~#</span> {command}
                </div>,
              ],
            }
          : tab
      )
    );

    if (command === 'clear') {
      clearTerminal();
      return;
    }

    try {
      // Send command to API
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming the API returns 'result' for successful commands
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === activeTabId
              ? {
                  ...tab,
                  output: [
                    ...tab.output,
                    <div key={`result-${Date.now()}`}>
                      <Ansi text={data.result || 'No output returned'} />
                    </div>,
                  ],
                }
              : tab
          )
        );
      } else {
        // If the API response contains an 'error' key
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === activeTabId
              ? {
                  ...tab,
                  output: [
                    ...tab.output,
                    <div key={`error-${Date.now()}`} className="text-red-500">
                      Error: {data.error || 'Unknown error'}
                    </div>,
                  ],
                }
              : tab
          )
        );
      }
    } catch (error) {
      // Handle any network or unexpected errors
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                output: [
                  ...tab.output,
                  <div key={`error-${Date.now()}`} className="text-red-500">
                    Error: Network or unexpected error
                  </div>,
                ],
              }
            : tab
        )
      );
    }

    // Clear the input after command execution
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, input: '' } : tab
      )
    );
  };

  // Clear the terminal for the active tab
  const clearTerminal = () => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, output: [asciiArt] } : tab
      )
    );
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, input: value } : tab
      )
    );
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    const activeTab = getActiveTab();
    if (e.key === 'Enter' && activeTab.input.trim()) {
      executeCommand(activeTab.input.trim());
    }
  };

  // Add a new tab
  const handleAddTab = () => {
    const newId = tabs.length ? Math.max(...tabs.map((t) => t.id)) + 1 : 1;
    setTabs((prevTabs) => [
      ...prevTabs,
      { id: newId, output: [asciiArt], input: '' },
    ]);
    setActiveTabId(newId);
  };

  // Close a tab
  const handleCloseTab = (id) => {
    const remainingTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(remainingTabs);

    if (id === activeTabId && remainingTabs.length > 0) {
      setActiveTabId(remainingTabs[0].id); // Switch to another tab
    }
  };

  // Ensure the page title matches the active tab
  useEffect(() => {
    document.title = `Tab ${activeTabId}`;
  }, [activeTabId]);

  return (
    <div>
      {/* Your terminal component UI here */}
      <div>
        <div>
          {getActiveTab()?.output.map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
        <input
          type="text"
          value={getActiveTab()?.input || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
        />
      </div>
    </div>
  );
}
