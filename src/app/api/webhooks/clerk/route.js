import { Webhook } from "svix";
import { headers } from "next/headers";
import { syncUser } from "./sync";

export async function POST(req) {
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // Verify headers are present
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- missing svix headers", {
      status: 400,
    });
  }

  // Get Clerk webhook secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Read raw body as text for accurate signature verification
  const body = await req.text();

  // Create new Svix instance
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;

  // Verify signature
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Error verifying Clerk webhook signature:", err.message);
    return new Response("Error occurred -- verification failed", {
      status: 400,
    });
  }

  const eventType = evt.type;

  console.log(`Clerk webhook received: ${eventType} (User ID: ${evt.data.id})`);

  try {
    await syncUser(eventType, evt.data);
    return new Response("Clerk webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error database-synchronizing Clerk user:", error.message);
    return new Response("Internal server error during DB write", { status: 500 });
  }
}
