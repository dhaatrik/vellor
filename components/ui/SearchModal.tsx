import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Input } from '.';
import { useStore } from '../../store';
import { useNavigate } from 'react-router-dom';

export const SearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const students = useStore(s => s.students);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  const searchableStudents = useMemo(() => {
    return students.map(s => ({
      ...s,
      _searchableName: (s.firstName + ' ' + s.lastName).toLowerCase()
    }));
  }, [students]);

  // ⚡ Bolt Performance: Hoist query.toLowerCase() outside the filter loop
  // to prevent unnecessary string operations during the O(N) array search.
  const lowerQuery = query.toLowerCase();
  const filteredStudents = query === '' ? [] : searchableStudents.filter(s =>
    s._searchableName.includes(lowerQuery)
  ).slice(0, 5);

  const handleSelectStudent = (id: string) => {
    navigate(`/students/${id}`);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Command Palette">
      <div className="space-y-4">
        <Input 
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students..."
        />
        {query && filteredStudents.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</h4>
            {filteredStudents.map(s => (
              <button
                key={s.id} 
                type="button"
                onClick={() => handleSelectStudent(s.id)}
                className="w-full text-left p-3 bg-gray-50 dark:bg-primary-light rounded-xl cursor-pointer hover:bg-accent/10 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:bg-accent/10 focus-visible:text-accent transition-colors flex items-center gap-3"
                aria-label={`Select student ${s.firstName} ${s.lastName}`}
              >
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-accent text-sm">{s.firstName[0]}</span>
                </div>
                <div className="dark:text-white font-medium">{s.firstName} {s.lastName}</div>
              </button>
            ))}
          </div>
        )}
        {query && filteredStudents.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No results found for "{query}"</p>
        )}
        {!query && (
          <div className="text-sm text-gray-500 space-y-2 py-2">
            <p className="flex items-center gap-2"><kbd className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs">Ctrl+K</kbd> Search / Command Palette</p>
            <p className="flex items-center gap-2"><kbd className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs">Ctrl+L</kbd> Quick Log</p>
            <p className="flex items-center gap-2"><kbd className="bg-gray-100 dark:bg-white/10 px-2 py-1 rounded text-xs">Shift+P</kbd> Mark hovered item Paid</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
