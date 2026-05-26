const fs = require('fs');
const file = './components/ui/SearchModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Needs useStore destructured at the top
if (!content.includes('const addToast = useStore(s => s.addToast);')) {
  content = content.replace(
    'const navigate = useNavigate();',
    'const navigate = useNavigate();\n  const addToast = useStore(s => s.addToast);'
  );
}

// Update the clipboard feedback
content = content.replace(
  "console.log('Copied portal link to clipboard');",
  "addToast('Portal link copied to clipboard!', 'success');"
);

// Prepare the new return block
const newReturn = `
  const handleItemKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectStudent(id);
    }
  };

  const studentItems = [];
  for (let i = 0, len = filteredStudents.length; i < len; i++) {
    const s = filteredStudents[i];
    studentItems.push(
      <div
        key={s.id}
        role="button"
        tabIndex={0}
        onClick={() => handleSelectStudent(s.id)}
        onKeyDown={(e) => handleItemKeyDown(e, s.id)}
        className="p-3 bg-gray-50 dark:bg-primary-light rounded-xl cursor-pointer hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary transition-colors flex items-center gap-3"
      >
        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-accent text-sm">{s.firstName[0]}</span>
        </div>
        <div className="dark:text-white font-medium">{s.firstName} {s.lastName}</div>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Command Palette">
      <div className="space-y-4">
        <div className="relative flex items-center w-full px-4 py-3 bg-primary-dark dark:bg-black rounded-2xl border border-transparent focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all duration-200">
          <span className="text-accent font-mono mr-2 select-none" aria-hidden="true">{'> '}</span>
          <label htmlFor="terminal-search-input" className="sr-only">Terminal search command input</label>
          <input
            id="terminal-search-input"
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or enter command..."
            className="w-full bg-transparent text-white font-mono focus:outline-none placeholder-gray-500 sm:text-sm"
          />
        </div>
        {query && filteredStudents.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Results</h4>
            {studentItems}
          </div>
        )}
        {query && filteredStudents.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mb-3">
              <Icon iconName="alert-circle" className="w-6 h-6 text-danger" />
            </div>
            <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">ERR: COMMAND_UNRECOGNIZED</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">No matching records or macros found for "{query}". Try <kbd className="bg-gray-100 dark:bg-white/10 px-1 rounded text-xs font-mono">/help</kbd> for available commands.</p>
          </div>
        )}
        {!query && (
          <div className="text-sm text-gray-500 space-y-2 py-2 font-mono">
            <p className="flex items-center gap-2"><kbd className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs text-black dark:text-white">Ctrl+K</kbd> Search / Command Palette</p>
            <p className="flex items-center gap-2"><kbd className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs text-black dark:text-white">/log</kbd> Quick Log Transaction</p>
            <p className="flex items-center gap-2"><kbd className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs text-black dark:text-white">/portal</kbd> Generate Portal Access</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
`;

const startIndex = content.indexOf('  return (');
content = content.substring(0, startIndex) + newReturn;

fs.writeFileSync(file, content);
