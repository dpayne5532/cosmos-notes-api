const { app } = require("@azure/functions");
const { v4: uuidv4 } = require("uuid");
const container = require("../shared/cosmos");

app.http("notes", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      if (request.method === "GET") {
        const query = {
          query: `
            SELECT 
              c.id,
              c.title,
              c.body,
              c.createdAt
            FROM c
            ORDER BY c.createdAt DESC
          `
        };

        const { resources } = await container.items.query(query).fetchAll();

        return {
          status: 200,
          jsonBody: resources
        };
      }

      if (request.method === "POST") {
        const body = await request.json();

        if (!body.title || !body.body) {
          return {
            status: 400,
            body: "title and body are required"
          };
        }

        const note = {
          id: uuidv4(),
          title: body.title,
          body: body.body,
          createdAt: new Date().toISOString()
        };

        await container.items.create(note);

        return {
          status: 201,
          jsonBody: note
        };
      }

      return { status: 405 };
    } catch (err) {
      context.error(err);
      return {
        status: 500,
        body: "Server error"
      };
    }
  }
});
