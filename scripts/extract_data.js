const fs = require('fs');
const readline = require('readline');

async function extract() {
  const logPath = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\7a021ac8-fe15-4b01-811d-869b72917fa0\\.system_generated\\logs\\transcript_full.jsonl';
  const outPath = 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\7a021ac8-fe15-4b01-811d-869b72917fa0\\scratch\\raw_deliveries.tsv';
  
  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  let lastUserMessage = '';
  
  for await (const line of rl) {
    if (!line) continue;
    try {
      const parsed = JSON.parse(line);
      if (parsed.type === 'USER_INPUT' && parsed.content.includes('DEL-AID-')) {
        lastUserMessage = parsed.content;
      }
    } catch (e) {}
  }
  
  if (lastUserMessage) {
    // Extract the data table portion
    const match = lastUserMessage.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
    if (match && match[1]) {
      // Find the start of the table
      const tableStart = match[1].indexOf('Delivery ID\tClient ID');
      if (tableStart !== -1) {
        fs.mkdirSync('C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\7a021ac8-fe15-4b01-811d-869b72917fa0\\scratch', { recursive: true });
        fs.writeFileSync(outPath, match[1].substring(tableStart).trim());
        console.log('Extracted TSV to', outPath);
      } else {
        console.log('Could not find TSV header in the message');
      }
    } else {
      console.log('Could not find USER_REQUEST block');
    }
  } else {
    console.log('Could not find the user message with data');
  }
}

extract().catch(console.error);
