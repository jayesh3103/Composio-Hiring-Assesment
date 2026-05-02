const fs = require('fs');
const tools = JSON.parse(fs.readFileSync('tools.json', 'utf8'));
const simplified = tools.map(t => ({
  name: t.name,
  desc: t.description,
  toolkit: t.toolkit,
  in: t.inputParameters?.properties ? Object.keys(t.inputParameters.properties) : [],
  out: t.outputParameters?.properties ? Object.keys(t.outputParameters.properties) : []
}));
fs.writeFileSync('simplified_tools.json', JSON.stringify(simplified, null, 2));
console.log('Tools:', simplified.length, 'Size:', fs.statSync('simplified_tools.json').size);
