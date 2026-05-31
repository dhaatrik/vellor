const fs = require('fs');
const file = 'components/students/tests/StudentDetailView.test.tsx';
let content = fs.readFileSync(file, 'utf8');

// The original mock drops attributes:
// motion: {
//   div: ({ children, className, onClick }: any) => <div className={className} onClick={onClick}>{children}</div>,
//   button: ({ children, className, onClick }: any) => <button className={className} onClick={onClick}>{children}</button>,
// },

content = content.replace(
  /div: \({ children, className, onClick }: any\) => <div className={className} onClick={onClick}>{children}<\/div>/g,
  'div: ({ children, className, onClick, ...props }: any) => <div className={className} onClick={onClick} {...props}>{children}</div>'
);

content = content.replace(
  /button: \({ children, className, onClick }: any\) => <button className={className} onClick={onClick}>{children}<\/button>/g,
  'button: ({ children, className, onClick, ...props }: any) => <button className={className} onClick={onClick} {...props}>{children}</button>'
);

fs.writeFileSync(file, content);
console.log('Updated framer-motion mock in StudentDetailView.test.tsx');
