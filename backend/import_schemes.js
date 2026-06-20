const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const csv = require('csv-parser');

const db = new Database('scheme_hub.db');

// Create schemes table if it doesn't exist (matching existing schema in db.js)
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS schemes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    ministry TEXT,
    benefits TEXT,
    eligibility TEXT,
    documents TEXT,
    apply_link TEXT,
    category TEXT,
    min_age INTEGER DEFAULT 0,
    max_age INTEGER DEFAULT 100,
    gender TEXT DEFAULT 'all',
    min_income INTEGER DEFAULT 0,
    max_income INTEGER DEFAULT 9999999,
    states TEXT DEFAULT 'all',
    occupation TEXT DEFAULT 'all',
    education TEXT DEFAULT 'all',
    is_upcoming INTEGER DEFAULT 0,
    launch_date TEXT,
    application_start_date TEXT,
    application_end_date TEXT,
    is_new INTEGER DEFAULT 0,
    date_added TEXT DEFAULT (datetime('now'))
  )
`;

db.exec(createTableSQL);

console.log("🏗️  Starting import of 3400 schemes...\n");

const csvPath = 'c:/Users/ponna/OneDrive/Desktop/Mini Project/enhanced_schemes.csv';
const schemes = [];
let rowCount = 0;

fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (row) => {
    rowCount++;
    
    // Map CSV columns to database schema (matching existing db.js structure)
    const scheme = {
      id: `scheme-${rowCount}`,
      name: row.scheme_name || '',
      description: row.details || '',
      benefits: row.benefits || '',
      eligibility: row.eligibility || '',
      documents: row.documents || '',
      category: row.schemeCategory || row.level || 'Other',
      ministry: row.ministry || row.level || 'Central',
      min_age: parseInt(row.min_age) || 18,
      max_age: parseInt(row.max_age) || 65,
      gender: row.gender || 'all',
      min_income: parseInt(row.min_income) || 0,
      max_income: parseInt(row.max_income) || 10000000,
      states: row.states || 'ALL',
      occupation: row.occupation || 'all',
      education: row.education || 'all',
      apply_link: row.apply_link || '',
      is_upcoming: row.is_upcoming === 'true' ? 1 : 0,
      launch_date: row.launch_date || new Date().toISOString().split('T')[0],
      application_start_date: row.application_start_date || new Date().toISOString().split('T')[0],
      application_end_date: row.application_end_date || 'Ongoing',
      is_new: row.is_new === 'true' ? 1 : 0,
      date_added: row.date_added || new Date().toISOString().split('T')[0]
    };
    
    schemes.push(scheme);

    // Insert in batches of 100 to avoid memory issues
    if (schemes.length >= 100) {
      insertSchemes(schemes);
      schemes.length = 0;
    }

    if (rowCount % 500 === 0) {
      console.log(`⏳ Processed ${rowCount} schemes...`);
    }
  })
  .on('end', () => {
    // Insert remaining schemes
    if (schemes.length > 0) {
      insertSchemes(schemes);
    }
    
    console.log(`\n✅ Successfully imported ${rowCount} schemes!`);
    
    // Print statistics
    const stats = db.prepare('SELECT COUNT(*) as count FROM schemes').get();
    console.log(`📊 Total schemes in database: ${stats.count}`);
    
    const byCategory = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM schemes 
      GROUP BY category 
      ORDER BY count DESC
    `).all();
    
    console.log('\n📈 Schemes by Category:');
    byCategory.forEach(cat => {
      console.log(`   ${cat.category}: ${cat.count} schemes`);
    });
    
    db.close();
    process.exit(0);
  })
  .on('error', (err) => {
    console.error('❌ Error reading CSV:', err);
    db.close();
    process.exit(1);
  });

function insertSchemes(schemeBatch) {
  const insert = db.prepare(`
    INSERT OR REPLACE INTO schemes (
      id, name, description, benefits, eligibility, documents, 
      category, ministry, min_age, max_age, gender, 
      min_income, max_income, states, occupation, education, 
      apply_link, is_upcoming, launch_date, application_start_date, 
      application_end_date, is_new, date_added
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  try {
    const insertMany = db.transaction((schemes) => {
      for (const scheme of schemes) {
        insert.run(
          scheme.id,
          scheme.name,
          scheme.description,
          scheme.benefits,
          scheme.eligibility,
          scheme.documents,
          scheme.category,
          scheme.ministry,
          scheme.min_age,
          scheme.max_age,
          scheme.gender,
          scheme.min_income,
          scheme.max_income,
          scheme.states,
          scheme.occupation,
          scheme.education,
          scheme.apply_link,
          scheme.is_upcoming,
          scheme.launch_date,
          scheme.application_start_date,
          scheme.application_end_date,
          scheme.is_new,
          scheme.date_added
        );
      }
    });

    insertMany(schemeBatch);
  } catch (err) {
    console.error('❌ Error inserting schemes:', err.message);
  }
}
