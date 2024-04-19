const express = require('express');
const ace = require('atlassian-connect-express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const addon = ace(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(addon.middleware());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Basic route
app.get('/', (req, res) => {
    res.send("Hello World!");
});

// Start server
const port = addon.config.port();
app.listen(port, () => {
    console.log(`App running at http://localhost:${port}`);
});
app.post('/update-issue', addon.authenticate(), async (req, res) => {
    const { issueKey, issueData } = req.body;
    const httpClient = addon.httpClient(req);

    try {
        const response = await httpClient.put({
            url: `https:///rest/api/3/issue/${issueKey}?overrideScreenSecurity=true&overrideEditableFlag=true`,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(issueData)
        });
        res.status(200).send(response.body);
    } catch (error) {
        console.error('Failed to update issue:', error);
        res.status(500).send('Failed to update issue.');
    }
});
