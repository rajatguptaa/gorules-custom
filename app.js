/*
README — GoRules Starter (Node.js)

What this is
-------------
A minimal "rules-as-a-service" starter inspired by https://gorules.io.
It provides a small Node.js + Express API that lets you:
 - create/list/update/delete rules
 - evaluate rules by id against supplied JSON data
 - evaluate ad-hoc rules

Rules use the json-logic format (https://jsonlogic.com/) which is simple
and expressive for boolean logic, comparisons, arithmetic, and basic transforms.

Files
-----
This single file contains the app code (index.js). To run you also need a package.json
shown below — paste that into package.json in the same folder.

package.json
------------
{
  "name": "gorules-starter",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "json-logic-js": "^1.2.3",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.22"
  }
}

How to run
----------
1) Create a folder and save this file as index.js
2) Create package.json using the snippet above
3) Run:
   npm install
   npm run dev   # or npm start
4) API will be available at http://localhost:3000

API Endpoints (quick)
---------------------
POST /rules            -> create rule  { name, description, rule }
GET  /rules            -> list rules
GET  /rules/:id        -> get rule
PUT  /rules/:id        -> update rule
DELETE /rules/:id      -> delete rule
POST /rules/:id/evaluate -> evaluate stored rule with { data }
POST /evaluate         -> evaluate ad-hoc rule { rule, data }

Rule format
-----------
Rules follow json-logic. Example rule (deliverable if distance <= 50 and area != 'Rural'):

{
  "and": [
    { "<=": [ {"var": "distanceKm"}, 50 ] },
    { "!=": [ {"var": "areaType"}, "Rural" ] }
  ]
}

Notes / Next steps
------------------
- Replace in-memory store with a database (Postgres, MongoDB, or lowdb for file-based)
- Add API key / JWT auth
- Add rate-limiting, billing & usage meters for SaaS
- Add webhooks to inform callers about rule evaluation results
- Add a React admin UI

*/

// ----- index.js (app code) -----
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jsonLogic = require('json-logic-js');
const { v4: uuidv4 } = require('uuid');

const DATA_FILE = path.join(__dirname, 'rules.json');

const app = express();
app.use(cors());
app.use(express.json());

// Simple persistent store using JSON file (fallback to memory if file not writable)
let rules = {};

function loadRules() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      rules = JSON.parse(raw);
    } else {
      rules = {};
      // bootstrap sample rule
      const id = uuidv4();
      rules[id] = {
        id,
        name: 'Sample deliverability rule',
        description: 'Deliverable if distanceKm <= 50 and areaType != Rural',
        rule: { "and": [ { "<=": [ {"var": "distanceKm"}, 50 ] }, { "!=": [ {"var": "areaType"}, "Rural" ] } ] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveRules();
    }
  } catch (err) {
    console.error('Failed to load rules.json, using empty store', err);
    rules = {};
  }
}

function saveRules() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(rules, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save rules.json', err);
  }
}

loadRules();

// Middleware: basic request logger
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Create rule
app.post('/rules', (req, res) => {
  const { name, description, rule } = req.body;
  if (!name || !rule) return res.status(400).json({ error: 'name and rule are required' });
  const id = uuidv4();
  const now = new Date().toISOString();
  rules[id] = { id, name, description: description || '', rule, createdAt: now, updatedAt: now };
  saveRules();
  res.status(201).json(rules[id]);
});

// List rules
app.get('/rules', (req, res) => {
  const list = Object.values(rules).map(r => ({ id: r.id, name: r.name, description: r.description, createdAt: r.createdAt }));
  res.json(list);
});

// Get rule
app.get('/rules/:id', (req, res) => {
  const r = rules[req.params.id];
  if (!r) return res.status(404).json({ error: 'rule not found' });
  res.json(r);
});

// Update rule
app.put('/rules/:id', (req, res) => {
  const r = rules[req.params.id];
  if (!r) return res.status(404).json({ error: 'rule not found' });
  const { name, description, rule } = req.body;
  if (name) r.name = name;
  if (description) r.description = description;
  if (rule) r.rule = rule;
  r.updatedAt = new Date().toISOString();
  rules[req.params.id] = r;
  saveRules();
  res.json(r);
});

// Delete rule
app.delete('/rules/:id', (req, res) => {
  const r = rules[req.params.id];
  if (!r) return res.status(404).json({ error: 'rule not found' });
  delete rules[req.params.id];
  saveRules();
  res.status(204).send();
});

// Evaluate stored rule
app.post('/rules/:id/evaluate', (req, res) => {
  const r = rules[req.params.id];
  if (!r) return res.status(404).json({ error: 'rule not found' });
  const data = req.body.data || {};
  try {
    const result = jsonLogic.apply(r.rule, data);
    res.json({ ruleId: r.id, result, rule: r.rule });
  } catch (err) {
    res.status(500).json({ error: 'rule evaluation failed', details: err.message });
  }
});

// Evaluate ad-hoc rule
app.post('/evaluate', (req, res) => {
  const { rule, data } = req.body;
  if (!rule) return res.status(400).json({ error: 'rule is required' });
  try {
    const result = jsonLogic.apply(rule, data || {});
    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: 'rule evaluation failed', details: err.message });
  }
});

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`GoRules-starter listening on http://localhost:${PORT}`));
