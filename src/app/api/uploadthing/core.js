import { createUploadthing } from "uploadthing/next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  resumeUploader: f({
    pdf: {
      maxFileSize: "10MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
      maxFileSize: "10MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      // Get the authenticated user from Clerk
      const { userId: clerkId } = await auth();
      if (!clerkId) {
        throw new Error("Unauthorized - Clerk session not found");
      }

      // Fetch the corresponding internal user database record
      let dbUser = await db.user.findUnique({
        where: { clerkId },
      });

      // Fallback: Create user record in DB if Clerk webhooks were blocked locally
      if (!dbUser) {
        const user = await currentUser();
        if (!user) {
          throw new Error("Unauthorized - Clerk user profile could not be loaded");
        }

        const email = user.emailAddresses?.[0]?.email_address;
        if (!email) {
          throw new Error("Unauthorized - Missing user email address");
        }

        dbUser = await db.user.create({
          data: {
            clerkId,
            email,
            firstName: user.firstName || null,
            lastName: user.lastName || null,
            imageUrl: user.imageUrl || null,
          },
        });
      }

      // Metadata to pass to onUploadComplete
      return { dbUserId: dbUser.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Determine file format enum type
      const fileExtension = file.name.split(".").pop().toLowerCase();
      const fileType = fileExtension === "docx" ? "DOCX" : "PDF";

      // Save upload metadata directly in the database linked to the user
      const resume = await db.resume.create({
        data: {
          userId: metadata.dbUserId,
          fileName: file.name,
          fileUrl: file.url,
          fileSize: file.size,
          fileType: fileType,
          status: "UPLOADED",
          isPrimary: false, // Default value
        },
      });

      return {
        uploadedBy: metadata.dbUserId,
        resumeId: resume.id,
        fileName: file.name,
      };
    }),
};
