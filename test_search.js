const q = '/portal share "Jane Doe"';
const spaceIndex = q.indexOf(' ');
const command = spaceIndex === -1 ? q : q.slice(0, spaceIndex);
const args = spaceIndex === -1 ? '' : q.slice(spaceIndex + 1).trim();

console.log({command, args});
