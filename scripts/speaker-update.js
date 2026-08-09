const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Google Sheets API setup
const apiKey = 'AIzaSyBJ5o87KpcVXliP3f4C0EQJ09I_l_Pn1ds'; // replace with your API key
const sheetId = '1nXqc38whbDDE9BQzElO1E6kWd4QaZ21kI9VRaqDqSBc'; // replace with your sheet ID
const sheetRange = 'Speakers!A:E'; // adjust the range if needed

// Google Sheets API URL
const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${apiKey}`;

// fetch data from google sheets
async function fetchData() {
  try {
    const response = await axios.get(sheetUrl);
    const rows = response.data.values;
    if (rows && rows.length) {
      console.log('Data fetched, processing...');
      const newData = processRows(rows);
      updateTsFile(newData);
    } else {
      console.log('No data found.');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// convert name to key (lowercase, spaces replaced with hyphens)
function generateKey(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace('.', '');
}

// process rows from google sheets
function processRows(rows) {
  return rows.slice(1).map(row => {
    const [name, position, company, bio] = row;
    const key = generateKey(name);
    return {
      key,
      name,
      position,
      company,
      bio: bio ? bio.replace(/\n/g, '\n\t<br/>\n\t') : undefined,
    };
  });
}

// update TS file by appending new entries
function updateTsFile(newData) {
  const filePath = path.join(__dirname, '../src/constants/speakers.ts');
  let existingData = '';

  // read the existing content of the file
  if (fs.existsSync(filePath)) {
    existingData = fs.readFileSync(filePath, 'utf-8');
  }

  // find where the SPEAKERS object ends
  const speakersStart = existingData.indexOf('export const SPEAKERS: { [key: string]: Speaker } = {');
  const speakersEnd = existingData.indexOf('};', speakersStart);

  if (speakersStart === -1 || speakersEnd === -1) {
    console.log('SPEAKERS object not found in the file.');
    return;
  }

  // Get the content of the SPEAKERS object to check for existing entries
  const speakersContent = existingData.slice(speakersStart, speakersEnd);

  // Extract existing speaker keys using regex
  const existingKeys = Array.from(speakersContent.matchAll(/"([^"]+)":/g)).map(match => match[1]);
  console.log(`Found ${existingKeys.length} existing speakers`);

  // Filter out speakers that already exist
  const newSpeakers = newData.filter(entry => !existingKeys.includes(entry.key));
  console.log(`Adding ${newSpeakers.length} new speakers`);

  if (newSpeakers.length === 0) {
    console.log('No new speakers to add');
    return;
  }

  // format new entries
  const newEntries = newSpeakers.map(entry => {
    return `  "${entry.key}": {
    "image": "${entry.key}.webp",
    "name": "${entry.name}",
    "position": "${entry.position || 'undefined'}",
    "company": "${entry.company || 'undefined'}",
    "bio": \`${entry.bio || 'undefined'}\`,
  }`;
  }).join(',\n');

  // split the file content
  const beforeClosingBrace = existingData.slice(0, speakersEnd);
  const afterClosingBrace = existingData.slice(speakersEnd);

  // check if we need to add a comma
  const needsComma = beforeClosingBrace.trim().slice(-1) !== ',';
  const comma = needsComma ? ',' : '';

  // combine everything
  const updatedData = beforeClosingBrace + comma + '\n' + newEntries + afterClosingBrace;

  // write the updated data back to the file
  fs.writeFileSync(filePath, updatedData);
  console.log('New speakers appended successfully!');
}

// start the process
fetchData();
