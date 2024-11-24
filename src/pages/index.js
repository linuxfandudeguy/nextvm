import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [tabs, setTabs] = useState([{ id: 1, output: [asciiArt], input: '' }]);
  const [activeTabId, setActiveTabId] = useState(1);
  const terminalRef = useRef(null);

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

  const getActiveTab = () => tabs.find((tab) => tab.id === activeTabId);

  const executeCommand = async (command) => {
    const activeTab = getActiveTab();

    // Display entered command
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

    // Handle local commands
    if (command === 'clear') {
      clearTerminal();
      return;
    }

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();
      if (response.ok) {
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === activeTabId
              ? {
                  ...tab,
                  output: [...tab.output, <div key={`result-${Date.now()}`}>{data.result}</div>],
                }
              : tab
          )
        );
      } else {
        setTabs((prevTabs) =>
          prevTabs.map((tab) =>
            tab.id === activeTabId
              ? {
                  ...tab,
                  output: [...tab.output, <div key={`error-${Date.now()}`}>Error: {data.error}</div>],
                }
              : tab
          )
        );
      }
    } catch (error) {
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTabId
            ? {
                ...tab,
                output: [
                  ...tab.output,
                  <div key={`error-${Date.now()}`}>
                    Error: Failed to execute command. {error.message}
                  </div>,
                ],
              }
            : tab
        )
      );
    }
  };

  const clearTerminal = () => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, output: [asciiArt] } : tab
      )
    );
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === activeTabId ? { ...tab, input: value } : tab
      )
    );
  };

  const handleKeyPress = (e) => {
    const activeTab = getActiveTab();
    if (e.key === 'Enter' && activeTab.input.trim()) {
      executeCommand(activeTab.input.trim());
      setTabs((prevTabs) =>
        prevTabs.map((tab) =>
          tab.id === activeTabId ? { ...tab, input: '' } : tab
        )
      );
    }
  };

  const handleAddTab = () => {
    const newId = tabs.length ? Math.max(...tabs.map((t) => t.id)) + 1 : 1;
    setTabs((prevTabs) => [
      ...prevTabs,
      { id: newId, output: [asciiArt], input: '' },
    ]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id) => {
    setTabs((prevTabs) => prevTabs.filter((tab) => tab.id !== id));
    if (id === activeTabId && tabs.length > 1) {
      const nextTab = tabs.find((tab) => tab.id !== id);
      setActiveTabId(nextTab.id);
    }
  };

  useEffect(() => {
    document.title = `Tab ${activeTabId}`;
  }, [activeTabId]);

  return (
    <div
      className="min-h-screen bg-gray-900 text-white flex flex-col"
      style={{ margin: 0, padding: 0, height: '100vh', width: '100vw' }}
    >
      <div className="flex bg-gray-900 p-2 border-b border-gray-700">
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
      <div
        ref={terminalRef}
        className="flex-grow p-4 overflow-auto bg-gray-900 text-white"
        style={{ whiteSpace: 'pre' }}
      >
        {getActiveTab()?.output.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
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

