# AGENTS
- Meeting note source merging lives in public/meeting-notes.js and runs before approval deduplication; one document can produce many approvals but must remain one repository entry.
- The prototype (public/prototype.html) talks to n8n only via the same-origin proxy src/routes/api/n8n.$.ts; n8n URL and key live in server env (N8N_BASE_URL, N8N_ACCESS_KEY) so credentials never reach the browser.
