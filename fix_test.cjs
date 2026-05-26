const fs = require('fs');
const file = './components/ui/tests/SearchModal.test.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "expect(screen.getByText('We couldn\\'t find anyone matching \"xyz\"')).toBeInTheDocument();",
  "expect(screen.getByText(/No matching records or macros found for \"xyz\"/)).toBeInTheDocument();"
);

fs.writeFileSync(file, content);
