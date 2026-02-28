import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient("http://localhost:3210");

async function main() {
    const messages = await client.query("queries:getAllMessages" as any) || [];
    console.log(messages.slice(-5));
}
main().catch(console.error);
