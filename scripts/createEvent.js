const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createEvent() {
  console.log('Event Creation Script\n');
  
  const event = {
    id: null,
    title: '',
    date: '',
    timeStart: '',
    description: '',
    eventText: null,
    topicalCoverage: [],
    image: '',
    slug: '',
    locationImage: '',
    locationAddress: '',
    eventShorthand: '',
    registerLink: '',
  };

  // Get existing events to determine next ID
  const eventsPath = path.join(__dirname, '../src/constants/events.tsx');
  const eventsContent = fs.readFileSync(eventsPath, 'utf8');
  const lastIdMatch = eventsContent.match(/id:\s*(\d+)/g);
  const lastId = lastIdMatch ? Math.max(...lastIdMatch.map(id => parseInt(id.match(/\d+/)[0]))) : 0;
  event.id = lastId + 1;

  // Gather basic information
  event.title = await question('Event Title: ');
  event.date = await question('Event Date (e.g., "March 18-19, 2025"): ');
  event.timeStart = await question('Event Start Time (ISO format, e.g., "2025-03-18T13:00:00Z"): ');
  event.description = await question('Event Description: ');
  event.eventShorthand = await question('Event Shorthand (e.g., "2025SDPC"): ');
  
  // Generate slug from title
  event.slug = event.title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Image paths
  event.image = await question('Event Image Path (e.g., "/2025_EventName.webp"): ');
  event.locationImage = await question('Location Image Path (e.g., "/locations/venue.webp"): ');
  
  // Location and registration
  event.locationAddress = await question('Location Address: ');
  event.registerLink = await question('Registration Link: ');

  // Topical coverage
  console.log('\nEnter topical coverage items (empty description to finish):');
  while (true) {
    const description = await question('Topic Description (or press enter to finish): ');
    if (!description) break;
    event.topicalCoverage.push({ tagline: '', description });
  }

  // Generate the event object string
  const eventString = `  {
    id: ${event.id},
    eventShorthand: "${event.eventShorthand}",
    title: "${event.title}",
    date: "${event.date}",
    timeStart: "${event.timeStart}",
    description: \`${event.description}\`,
    eventText: (
      <div className="max-container font-light">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center font-gotham text-slate-700 mb-6">
          Event Overview
        </h2>
        <p className="mb-4 leading-relaxed">
          ${event.description}
        </p>
      </div>
    ),
    topicalCoverage: [
${event.topicalCoverage.map(topic => `      { tagline: "", description: "${topic.description}" }`).join(',\n')}
    ],
    image: "${event.image}",
    slug: "${event.slug}",
    locationImage: "${event.locationImage}",
    locationAddress: \`${event.locationAddress}\`,
    registerLink: "${event.registerLink}",
  }`;

  // Read the current events file
  let content = eventsContent;
  
  // Find the last closing bracket of the EVENTS array
  const lastArrayBracket = content.lastIndexOf('];');
  
  // Insert the new event before the closing bracket
  const updatedContent = content.slice(0, lastArrayBracket) + 
    (content[lastArrayBracket - 1] === '}' ? ',\n' : '') +
    eventString + 
    content.slice(lastArrayBracket);

  // Write the updated content back to the file
  fs.writeFileSync(eventsPath, updatedContent);

  console.log('\nEvent created successfully!');
  console.log(`\nNew event added with ID: ${event.id}`);
  console.log(`Slug: ${event.slug}`);

  rl.close();
}

createEvent().catch(console.error);
