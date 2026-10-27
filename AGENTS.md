# AGENTS
- Prototype feedback provenance and import corrections live in public/prototype-feedback.js; retain the submission ID through n8n and project prototype comments into Stakeholder Feedback without duplicating stored cards.
- Meeting note source merging lives in public/meeting-notes.js and runs before approval deduplication; one document can produce many approvals but must remain one repository entry.
- The one-master-requirements-doc rule lives in public/requirements-docs.js (ReqDocs.canAddReqDoc); the prototype enforces it in the add form, the form handler, and the Confluence simulation, and deleting the linked doc re-enables adding.
- The prototype (public/prototype.html) talks to n8n only via the same-origin proxy src/routes/api/public/n8n.$.ts (under /api/public/ because hosted deployments require auth for other /api/ routes); n8n URL and key live in server env (N8N_BASE_URL, N8N_ACCESS_KEY) so credentials never reach the browser.
