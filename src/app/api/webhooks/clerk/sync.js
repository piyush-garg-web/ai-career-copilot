import { db } from "../../../../lib/db.js";

// Sync Clerk user events to the database
export async function syncUser(eventType, data) {
  const { id } = data;

  if (eventType === "user.created") {
    const email = data.email_addresses?.[0]?.email_address;
    if (!email) {
      throw new Error("Missing email address");
    }

    return await db.user.create({
      data: {
        clerkId: id,
        email: email,
        firstName: data.first_name || null,
        lastName: data.last_name || null,
        imageUrl: data.image_url || null,
      },
    });
  }

  if (eventType === "user.updated") {
    const email = data.email_addresses?.[0]?.email_address;
    if (!email) {
      throw new Error("Missing email address");
    }

    return await db.user.upsert({
      where: { clerkId: id },
      update: {
        email: email,
        firstName: data.first_name || null,
        lastName: data.last_name || null,
        imageUrl: data.image_url || null,
      },
      create: {
        clerkId: id,
        email: email,
        firstName: data.first_name || null,
        lastName: data.last_name || null,
        imageUrl: data.image_url || null,
      },
    });
  }

  if (eventType === "user.deleted") {
    return await db.user.deleteMany({
      where: { clerkId: id },
    });
  }

  throw new Error(`Unsupported event type: ${eventType}`);
}
