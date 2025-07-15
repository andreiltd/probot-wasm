import { Probot, ProbotOctokit } from "probot";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const OctokitWithFetch = ProbotOctokit.defaults({
  request: { fetch: globalThis.fetch },
  log: {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  },
});

const app = async (app) => {
  app.on("issues.opened", async (context) => {
    const params = context.issue({ body: "The owls are not what they seem!" });
    return context.octokit.issues.createComment(params);
  });
};


async function handleRequest(request) {
  const probot = new Probot({
    appId: __APP_ID__,
    privateKey: __PRIVATE_KEY__,
    secret: __WEBHOOK_SECRET__,
    Octokit: OctokitWithFetch,
    logLevel: "debug",
  });

  await probot.load(app);

  const id = request.headers.get("X-GitHub-Delivery");
  const name = request.headers.get("X-GitHub-Event");
  console.log(`Received event: ${name} with ID: ${id}`);

  const payload = await request.json();

  try {
    await probot.webhooks.receive({ id, name, payload });
    return new Response("OK");
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}
