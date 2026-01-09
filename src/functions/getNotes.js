const { app } = require("@azure/functions");
const container = require("../shared/cosmos");

app.http("getNotes", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        try {
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
        } catch (err) {
            context.error(err);
            return {
                status: 500,
                body: "Failed to fetch notes"
            };
        }
    }
});
