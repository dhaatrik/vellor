import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Icon } from '.';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import { PaymentStatus } from '../../types';

export const SearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const students = useStore(s => s.students);
  const addTransaction = useStore(s => s.addTransaction);
  const exportTransactionsCSV = useStore(s => s.exportTransactionsCSV);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const addToast = useStore(s => s.addToast);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  const deferredQuery = React.useDeferredValue(query);

  // ⚡ Bolt Performance: Hoist query.toLowerCase() outside the filter loop
  // to prevent unnecessary string operations during the O(N) array search.
  const lowerQuery = deferredQuery.toLowerCase();

  // ⚡ Bolt Performance: Use an early-return bounded loop instead of .filter().slice()
  // to avoid scanning the entire students array once 5 matches are found.
  // We use the pre-computed searchName to prevent intermediate object allocations.
  const filteredStudents = useMemo(() => {
    if (deferredQuery === '') return [];

    const results = [];
    for (let i = 0, len = students.length; i < len; i++) {
      const student = students[i];
      const searchStr = student.searchName || (student.firstName + ' ' + student.lastName).toLowerCase();
      if (searchStr.includes(lowerQuery)) {
        results.push(student);
        if (results.length >= 5) break;
      }
    }
    return results;
  }, [students, deferredQuery, lowerQuery]);


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = query.trim();
      if (q.startsWith('/')) {
        const spaceIndex = q.indexOf(' ');
        const command = spaceIndex === -1 ? q : q.slice(0, spaceIndex);

        if (command === '/tax') {
          const args = spaceIndex === -1 ? '' : q.slice(spaceIndex + 1).trim();
          if (args === 'csv') {
            exportTransactionsCSV();
            setQuery('');
            onClose();
          }
        } else if (command === '/portal') {
          const args = spaceIndex === -1 ? '' : q.slice(spaceIndex + 1).trim();
          if (args.startsWith('share ')) {
            const nameStart = args.indexOf('"');
            const nameEnd = args.indexOf('"', nameStart + 1);
            if (nameStart !== -1 && nameEnd !== -1) {
              const studentName = args.slice(nameStart + 1, nameEnd);

              // Find student ID first (to use O(1) lookup as required)
              let student = null;
              const lowerName = studentName.toLowerCase();
              for (let i = 0, len = students.length; i < len; i++) {
                const s = students[i];
                if ((s.firstName + ' ' + s.lastName).toLowerCase() === lowerName) {
                  student = s;
                  break;
                }
              }

              if (student) {
                  const shareText = `Student Portal for ${student.firstName} ${student.lastName}`;
                  navigator.clipboard.writeText(shareText).then(() => {
                    addToast('Portal link copied to clipboard!', 'success');
                  });
                  setQuery('');
                  onClose();
              }
            }
          }
        } else if (command === '/log') {
          // /log "Student Name" [duration] [fee] [status]
          const args = spaceIndex === -1 ? '' : q.slice(spaceIndex + 1).trim();
          const nameStart = args.indexOf('"');
          const nameEnd = args.indexOf('"', nameStart + 1);

          if (nameStart !== -1 && nameEnd !== -1) {
            const studentName = args.slice(nameStart + 1, nameEnd);
            const remainingArgsStr = args.slice(nameEnd + 1).trim();

            // Extract remaining args without split
            let durationStr = '';
            let feeStr = '';
            let statusStr = '';

            let currentArgIndex = 0;
            let i = 0;
            const len = remainingArgsStr.length;

            while (i < len) {
                // Skip leading spaces
                while (i < len && remainingArgsStr[i] === ' ') {
                    i++;
                }

                if (i >= len) break;

                // Find next space or end
                let nextSpace = remainingArgsStr.indexOf(' ', i);
                if (nextSpace === -1) nextSpace = len;

                const arg = remainingArgsStr.slice(i, nextSpace);

                if (currentArgIndex === 0) durationStr = arg;
                else if (currentArgIndex === 1) feeStr = arg;
                else if (currentArgIndex === 2) statusStr = arg;

                currentArgIndex++;
                i = nextSpace;
            }

            let student = null;
            const lowerName = studentName.toLowerCase();
            for (let i = 0, len = students.length; i < len; i++) {
              const s = students[i];
              if ((s.firstName + ' ' + s.lastName).toLowerCase() === lowerName) {
                student = s;
                break;
              }
            }

            if (student) {
                addTransaction({
                    studentId: student.id,

                    date: new Date().toISOString(),
                    lessonFee: parseFloat(feeStr) || 0,
                    amountPaid: statusStr.toLowerCase() === 'paid' ? parseFloat(feeStr) || 0 : 0,
                    status: statusStr.toLowerCase() === 'paid' ? PaymentStatus.Paid : PaymentStatus.Due,
                    lessonDuration: parseInt(durationStr) || 60,
                });
                setQuery('');
                onClose();
            }
          }
        }
      }
    }
  };

  const handleSelectStudent = (id: string) => {
    navigate(`/students/${id}`);
    onClose();
  };


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
        <div className="relative flex items-center w-full px-4 py-3 bg-primary-dark dark:bg-black rounded-2xl border border-transparent focus-within:border-accent focus-within:ring-1 focus-within:ring-accent ">
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
              <Icon iconName="warning" className="w-6 h-6 text-danger" />
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
