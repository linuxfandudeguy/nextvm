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
    <div
      className="min-h-screen bg-gray-900 text-white flex flex-col"
      style={{ margin: 0, padding: 0, height: '100vh', width: '100vw' }}
    >
      {/* Tab bar */}
      <div
        className="flex overflow-x-auto bg-gray-900 p-2 border-b border-gray-700"
        style={{ flexShrink: 0 }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`p-2 cursor-pointer ${
              tab.id === activeTabId ? 'bg-gray-700' : 'bg-gray-900'
            }`}
            onClick={() => setActiveTabId(tab.id)}
          >
            Tab {tab.id}
            <button
              className="ml-2 text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                handleCloseTab(tab.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
        <button
          className="p-2 ml-auto bg-gray-700 hover:bg-gray-600"
          onClick={handleAddTab}
        >
          + Add Tab
        </button>
      </div>

      {/* Terminal window */}
      <div
        ref={terminalRef}
        className="flex-grow p-4 overflow-auto bg-gray-900 text-white"
        style={{ whiteSpace: 'pre', lineHeight: 1.4 }}
      >
        {getActiveTab()?.output.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>

      {/* Command input */}
      <div className="p-2 bg-gray-900 flex items-center">
        <span className="text-green-500">root@next:~#</span>
        <input
          type="text"
          value={getActiveTab()?.input || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="flex-grow bg-transparent text-white p-2 focus:outline-none"
          autoFocus
          placeholder="Enter command"
        />
      </div>
    </div>
  );
}
