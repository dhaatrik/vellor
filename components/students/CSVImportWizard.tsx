import React, { useState } from 'react';
import { Button, Modal, Icon, Select } from '../ui';
import { useStore } from '../../store';
import { Student } from '../../types';

interface CSVImportWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CSVImportWizard: React.FC<CSVImportWizardProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [originalHeaders, setOriginalHeaders] = useState<string[]>([]);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [mapping, setMapping] = useState<{ [key: string]: string }>({});
    const addStudent = useStore(s => s.addStudent);
    const addToast = useStore(s => s.addToast);
    
    // Very simple CSV parser for basic needs without external dependencies
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
             const text = event.target?.result as string;
             const lines = text.split('\n').map(l => l.trim()).filter(l => l);
             if (lines.length < 2) { 
                 addToast("Invalid CSV format or not enough data rows.", "error"); 
                 return; 
             }
             
             // Split safely avoiding commas inside quotes
             const parseLine = (line: string) => {
                 const result: string[] = [];
                 let cur = '';
                 let inQuotes = false;
                 for (let i = 0; i < line.length; i++) {
                     if (line[i] === '"') inQuotes = !inQuotes;
                     else if (line[i] === ',' && !inQuotes) {
                         result.push(cur.trim().replace(/^"|"$/g, ''));
                         cur = '';
                     } else cur += line[i];
                 }
                 result.push(cur.trim().replace(/^"|"$/g, ''));
                 return result;
             };

             const headers = parseLine(lines[0]);
             setOriginalHeaders(headers);
             
             const data = [];
             for (let i = 1; i < lines.length; i++) {
                 const row = parseLine(lines[i]);
                 let obj: any = {};
                 headers.forEach((h, idx) => obj[h] = row[idx] || '');
                 data.push(obj);
             }
             setCsvData(data);
             
             // Basic Auto-Map logic
             const newMap: { [key: string]: string } = {};
             headers.forEach(h => {
                 const hl = h.toLowerCase();
                 if (!newMap.firstName && (hl.includes('first') || hl === 'name')) newMap.firstName = h;
                 if (!newMap.lastName && hl.includes('last')) newMap.lastName = h;
                 if (!newMap.email && hl.includes('email')) newMap.email = h;
                 if (!newMap.studentPhone && (hl.includes('phone') || hl.includes('mobile'))) newMap.studentPhone = h;
                 if (!newMap.defaultRate && (hl.includes('rate') || hl.includes('fee') || hl.includes('price'))) newMap.defaultRate = h;
                 if (!newMap.subjects && hl.includes('subject')) newMap.subjects = h;
             });
             setMapping(newMap);
             setStep(2);
        };
        reader.readAsText(file);
    };

    const handleImport = () => {
        let count = 0;
        let skipped = 0;
        
        csvData.forEach(row => {
            let firstName = row[mapping.firstName || ''] || '';
            const lastName = row[mapping.lastName || ''] || '';
            
            // If they merged name into one field
            if (!mapping.lastName && firstName.includes(' ')) {
                const parts = firstName.split(' ');
                firstName = parts[0];
            }
            
            if (!firstName) {
                skipped++;
                return; // require at least a name
            }
            
            const newStudent: Pick<Student, 'firstName' | 'lastName' | 'contact' | 'tuition' | 'notes'> = {
                firstName,
                lastName: !mapping.lastName && row[mapping.firstName || ''].includes(' ') ? row[mapping.firstName || ''].substring(firstName.length).trim() : lastName,
                contact: {
                    email: row[mapping.email || ''] || '',
                    studentPhone: { countryCode: '+1', number: row[mapping.studentPhone || ''] || '' },
                    parentPhone1: { countryCode: '+1', number: '' }
                },
                tuition: {
                    defaultRate: parseFloat(row[mapping.defaultRate || '']) || 0,
                    rateType: 'hourly',
                    typicalLessonDuration: 60,
                    subjects: row[mapping.subjects || ''] ? [row[mapping.subjects || '']] : []
                },
                notes: 'Imported via CSV'
            };
            
            // Note: addStudent expects the full Student including id and dates, which updateStudent/addStudent slices typically handle or we must provide
            addStudent(newStudent as Student);
            count++;
        });
        
        if (count > 0) addToast(`Successfully imported ${count} students!`, 'success');
        if (skipped > 0) addToast(`Skipped ${skipped} rows without a first name.`, 'info');
        
        onClose();
        setTimeout(() => {
           setStep(1);
           setCsvData([]);
           setMapping({});
        }, 300);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Students (CSV)">
            {step === 1 && (
                <div className="text-center py-8">
                   <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-primary-light rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/10">
                      <Icon iconName="document-text" className="w-8 h-8 text-accent" />
                   </div>
                   <h3 className="text-xl font-display font-bold mb-2 text-gray-900 dark:text-white">Upload CSV File</h3>
                   <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Upload a CSV file containing your student roster to bulk import them into Vellor.</p>
                   
                   <label className="bg-accent text-white px-8 py-3.5 rounded-full cursor-pointer hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 font-bold inline-block">
                       Choose CSV File
                       <input type="file" accept=".csv" className="hidden" onClick={(e) => (e.target as HTMLInputElement).value = ''} onChange={handleFileUpload} />
                   </label>
                   
                   <div className="mt-8 p-4 bg-gray-50 dark:bg-primary/30 rounded-2xl text-left border border-gray-100 dark:border-white/5 text-sm">
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Supported Columns (Auto-mapped):</p>
                      <ul className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                         <li className="flex items-center gap-1.5"><Icon iconName="check-circle" className="w-3.5 h-3.5 text-success" /> First Name</li>
                         <li className="flex items-center gap-1.5"><Icon iconName="check-circle" className="w-3.5 h-3.5 text-success" /> Last Name</li>
                         <li className="flex items-center gap-1.5"><Icon iconName="check-circle" className="w-3.5 h-3.5 text-success" /> Email</li>
                         <li className="flex items-center gap-1.5"><Icon iconName="check-circle" className="w-3.5 h-3.5 text-success" /> Phone</li>
                         <li className="flex items-center gap-1.5"><Icon iconName="check-circle" className="w-3.5 h-3.5 text-success" /> Default Rate</li>
                         <li className="flex items-center gap-1.5"><Icon iconName="check-circle" className="w-3.5 h-3.5 text-success" /> Subjects</li>
                      </ul>
                   </div>
                </div>
            )}
            
            {step === 2 && (
                <div className="space-y-6">
                    <div className="bg-accent/10 border border-accent/20 p-4 rounded-2xl text-accent font-medium text-sm">
                        Found {csvData.length} records. Let's map your columns to Vellor fields. We've auto-mapped the ones we recognized.
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-primary/50 p-5 rounded-3xl space-y-4 border border-gray-100 dark:border-white/5 max-h-[50vh] overflow-y-auto custom-scrollbar">
                        {[
                          { field: 'firstName', label: 'First Name (Required)' },
                          { field: 'lastName', label: 'Last Name' },
                          { field: 'email', label: 'Email Address' },
                          { field: 'studentPhone', label: 'Phone Number' },
                          { field: 'defaultRate', label: 'Default Rate' },
                          { field: 'subjects', label: 'Subject' }
                        ].map(({field, label}) => (
                           <div key={field} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-primary-light rounded-xl border border-gray-200 dark:border-white/10">
                               <span className="text-sm font-bold text-gray-700 dark:text-gray-300 sm:w-1/3 truncate">{label}</span>
                               <div className="sm:w-2/3">
                                   <Select 
                                     value={mapping[field] || ''} 
                                     onChange={e => setMapping({...mapping, [field]: e.target.value})}
                                     options={[{label: '-- Skip Field --', value: ''}, ...originalHeaders.map(h => ({label: h, value: h}))]}
                                   />
                               </div>
                           </div>
                        ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-white/10">
                        <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full">Upload Different File</Button>
                        <Button variant="primary" onClick={handleImport} className="rounded-full px-6 shadow-lg shadow-accent/20 font-bold">Import {csvData.length} Students</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
};
