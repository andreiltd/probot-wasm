import { Probot, ProbotOctokit } from "probot";
import { getEnvironment } from 'wasi:cli/environment@0.2.3';

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
  const entries = getEnvironment();
  const env = Object.fromEntries(entries);

  const probot = new Probot({
    appId: env.APP_ID,
    privateKey: env.PRIVATE_KEY,
    secret: env.WEBHOOK_SECRET,
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
