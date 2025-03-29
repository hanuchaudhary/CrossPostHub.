// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";
// import { authOptions } from "../auth/[...nextauth]/options";
// import prisma from "@/config/prismaConfig";
// import { Providers } from "@/Types/Types";
// import { postQueue } from "@/lib/Redis/worker";
// import { CheckCreatedPostMiddleware } from "@/utils/CheckCreatedPostMiddleware";
// import { createNotification } from "@/utils/Controllers/NotificationController";
// import { validateMedia } from "@/utils/ValidateMedia";

// export async function POST(request: NextRequest) {
//   try {
//     // Authenticate user
//     const session = await getServerSession(authOptions);
//     if (!session || !session.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Fetch logged-in user
//     const loggedUser = await prisma.user.findUnique({
//       where: { id: session.user.id },
//       include: { accounts: true },
//     });
//     if (!loggedUser) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     // Check post creation limit
//     const result = await CheckCreatedPostMiddleware(loggedUser.id);
//     if (!result) {
//       return NextResponse.json(
//         {
//           error: `Post limit reached for the month. Please upgrade your plan to create more posts.`,
//         },
//         { status: 400 }
//       );
//     }

//     // Parse form data
//     const formData = await request.formData();
//     const postText = formData.get("postText") as string;
//     const medias = formData.getAll("medias") as File[];
//     const scheduleAt = formData.get("scheduleAt") as string;
//     const providersJson = formData.get("providers") as string;
//     const providers = JSON.parse(providersJson) as Providers[];

//     // Validate inputs
//     if (providers.length === 0) {
//       return NextResponse.json(
//         { error: "Please select at least one provider" },
//         { status: 400 }
//       );
//     }
//     if (!postText && medias.length === 0) {
//       return NextResponse.json(
//         { error: "Please enter some text or upload an image" },
//         { status: 400 }
//       );
//     }

//     try {
//       await validateMedia(medias);
//     } catch (error: any) {
//       return NextResponse.json(
//         { error: error.message },
//         { status: error.status || 400 }
//       );
//     }
//     // Convert medias to Base64
//     const mediasBase64 = await Promise.all(
//       medias.map(async (image) => {
//         const buffer = await image.arrayBuffer();
//         return Buffer.from(buffer).toString("base64");
//       })
//     );

//     // Add jobs to the queue for each provider
//     const results = await Promise.allSettled(
//       providers.map(async (provider) => {
//         try {

//           // job options for the queue
//           const jobOptions: any = {
//             attempts: 3, // Number of attempts to process the job
//             backoff: {
//               type: "exponential", // Exponential backoff strategy
//               delay: 5000, // Delay in milliseconds before retrying the job
//             },
//           };

//           if (scheduleAt) {
//             // Check if the scheduled time is in the past
//             const scheduleTime = new Date(scheduleAt);
//             jobOptions.delay = Math.max(0, scheduleTime.getTime() - Date.now());
//           }

//           const job = await postQueue.add(
//             "postQueue",
//             {
//               provider,
//               postText,
//               medias: mediasBase64,
//               userId: loggedUser.id,
//               scheduledFor: scheduleAt || null, // Pass the scheduled time to the job data
//             },
//             jobOptions
//           );

//           // Create a notification for the user
//           await createNotification({
//             message: `Processing post for ${provider}`,
//             type: "POST_STATUS",
//             userId: loggedUser.id as string,
//           });

//           return {
//             provider,
//             jobId: job.id,
//             status: "queued",
//             scheduledFor: scheduleAt || null,
//           };
//         } catch (error: any) {
//           console.error(`Failed to add job for provider: ${provider}`, error);
//           return { provider, error: error.message, status: "failed" };
//         }
//       })
//     );

//     // Format results for response
//     const formattedResults = results.map((result) => {
//       if (result.status === "fulfilled") {
//         return result.value;
//       } else {
//         return { status: "failed", error: result.reason };
//       }
//     });

//     return NextResponse.json({ results: formattedResults }, { status: 200 });
//   } catch (error) {
//     console.error("CreatePost Error:", error);
//     return NextResponse.json(
//       { error: "An unexpected error occurred. Please try again." },
//       { status: 500 }
//     );
//   }
// }

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/config/prismaConfig";
import { Providers } from "@/Types/Types";
import { CheckCreatedPostMiddleware } from "@/utils/CheckCreatedPostMiddleware";
import { createNotification } from "@/utils/Controllers/NotificationController";
import { validateMedia } from "@/utils/ValidateMedia";
import { Client } from "@upstash/qstash";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch logged-in user
    const loggedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });
    if (!loggedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check post creation limit
    const result = await CheckCreatedPostMiddleware(loggedUser.id);
    if (!result) {
      return NextResponse.json(
        {
          error: `Post limit reached for the month. Please upgrade your plan to create more posts.`,
        },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const postText = formData.get("postText") as string;
    const medias = formData.getAll("medias") as File[];
    const scheduleAt = formData.get("scheduleAt") as string;
    const providersJson = formData.get("providers") as string;
    const providers = JSON.parse(providersJson) as Providers[];

    // Validate inputs
    if (providers.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one provider" },
        { status: 400 }
      );
    }
    if (!postText && medias.length === 0) {
      return NextResponse.json(
        { error: "Please enter some text or upload an image" },
        { status: 400 }
      );
    }

    try {
      await validateMedia(medias);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      );
    }

    // Convert medias to Base64
    const mediasBase64 = await Promise.all(
      medias.map(async (image) => {
        const buffer = await image.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
      })
    );

    // Initialize QStash client
    const qstashClient = new Client({
      token: process.env.QSTASH_TOKEN!,
    });

    // Add jobs to QStash for each provider
    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        try {
          const jobData = {
            provider,
            postText,
            medias: mediasBase64, // Send base64-encoded media directly
            userId: loggedUser.id,
            scheduledFor: scheduleAt || null,
          };

          // Publish the message to QStash
          const publishResponse = await qstashClient.publishJSON({
            url: "https://crossposthub.kushchaudhary.com/api/post/process",
            body: jobData,
            retries: 3,
            delay: scheduleAt
              ? Math.floor((new Date(scheduleAt).getTime() - Date.now()) / 1000)
              : undefined,
          });

          // Create a notification for the user
          await createNotification({
            message: `Processing post for ${provider}`,
            type: "POST_STATUS",
            userId: loggedUser.id as string,
          });

          return {
            provider,
            jobId: publishResponse.messageId,
            status: "queued",
            scheduledFor: scheduleAt || null,
          };
        } catch (error: any) {
          console.error(`Failed to add job for provider: ${provider}`, error);
          return { provider, error: error.message, status: "failed" };
        }
      })
    );

    // Format results for response
    const formattedResults = results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return {
          provider: result.reason.provider,
          status: "failed",
          error: result.reason.error,
        };
      }
    });

    return NextResponse.json({ results: formattedResults }, { status: 200 });
  } catch (error) {
    console.error("CreatePost Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}