import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/config/prismaConfig";
import { Providers } from "@/Types/Types";
import { postQueue } from "@/lib/Redis/worker";
import { CheckCreatedPostMiddleware } from "@/utils/CheckCreatedPostMiddleware";
import { postSaveToDB } from "@/utils/Controllers/PostSaveToDb";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loggedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });
    if (!loggedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAllowed = await CheckCreatedPostMiddleware(loggedUser.id);
    if (!isAllowed) {
      return NextResponse.json(
        {
          error:
            "You have reached your monthly limit of 5 posts. Upgrade your plan to Pro",
        },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const postText = formData.get("postText") as string;
    const images = formData.getAll("images") as File[];
    const scheduleAt = formData.get("scheduleAt") as string;
    const providersJson = formData.get("providers") as string;
    const providers = JSON.parse(providersJson) as Providers[];

    if (providers.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one provider" },
        { status: 400 }
      );
    }
    if (!postText && images.length === 0) {
      return NextResponse.json(
        { error: "Please enter some text or upload an image" },
        { status: 400 }
      );
    }

    const imagesBase64 = await Promise.all(
      images.map(async (image) => {
        const buffer = await image.arrayBuffer();
        return Buffer.from(buffer).toString("base64");
      })
    );
    console.log("Images before adding to queue:", imagesBase64);

    const results = await Promise.allSettled(
      providers.map(async (provider) => {
        try {
          const jobOptions: any = {
            attempts: 3,
            backoff: {
              type: "exponential",
              delay: 5000,
            }
          };

          if (scheduleAt) {
            const scheduleTime = new Date(scheduleAt);
            jobOptions.delay = Math.max(0, scheduleTime.getTime() - Date.now());
          }

          const job = await postQueue.add(
            "postQueue",
            {
              provider,
              postText,
              images: imagesBase64,
              loggedUser,
              scheduledFor: scheduleAt || null,
            },
            jobOptions
          );

          if (await job.isFailed()) {
            return { provider, error: job.failedReason, status: "failed" };
          }

          if (await job.isCompleted()) {
            const postSave = await postSaveToDB({
              postText,
              userId: loggedUser.id,
              provider: provider,
              // scheduledFor: scheduleAt || null, // Save schedule time to DB
            });
            return { provider, jobId: job.id, status: "success", postSave };
          }

          console.log("Job added to the queue:", job.id, scheduleAt ? `(scheduled for ${scheduleAt})` : "(immediate)");
          return { 
            provider, 
            jobId: job.id, 
            status: "success",
            scheduledFor: scheduleAt || null 
          };
        } catch (error: any) {
          console.error(`Failed to add job for provider: ${provider}`, error);
          return { provider, error: error.message, status: "failed" };
        }
      })
    );

    const formattedResults = results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return { status: "failed", error: result.reason };
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

// Without Queue Logic
// const results = await Promise.all(
//     providers.map(async (provider) => {
//         if (provider === "linkedin") {

//             const linkedinAccount = loggedUser.accounts.find((acc) => acc.provider === "linkedin");
//             if (!linkedinAccount) {
//                 return NextResponse.json({ error: "LinkedIn account not found" }, { status: 400 });
//             }

//             if (images.length !== 0) {
//                 const assetURNs: string[] = [];

//                 for (const image of images) {
//                     const assetURN = await registerAndUploadMedia({
//                         accessToken: linkedinAccount.access_token!,
//                         personURN: linkedinAccount.providerAccountId!,
//                         image
//                     });
//                     assetURNs.push(assetURN);
//                 }

//                 const postResponse = await CreatePostWithMedia({
//                     accessToken: linkedinAccount.access_token!,
//                     personURN: linkedinAccount.providerAccountId!,
//                     assetURNs,
//                     text: postText
//                 });

//                 if (postResponse.error) {
//                     return { provider: "linkedin", error: postResponse.error };
//                 }

//                 const postSave = await postSaveToDB({ postText, userId: loggedUser.id, provider: "linkedin" });
//                 console.log("Post saved to DB:", postSave.id);

//                 return { provider: "linkedin", response: postResponse };
//             } else {
//                 const postResponse = await CreateTextPost({
//                     accessToken: linkedinAccount.access_token!,
//                     personURN: linkedinAccount.providerAccountId!,
//                     text: postText
//                 });

//                 const postSave = await postSaveToDB({ postText, userId: loggedUser.id, provider: "linkedin" });
//                 console.log("Post saved to DB:", postSave.id);

//                 return { provider: "linkedin", response: postResponse };
//             }
//         }
//         if (provider === "twitter") {
//             const twitterAccount = loggedUser.accounts.find((acc) => acc.provider === "twitter");
//             if (!twitterAccount) {
//                 return NextResponse.json({ error: "Twitter account not found" }, { status: 400 });
//             }

//             try {
//                 let mediaIds: string[] = [];
//                 if (images.length > 0) {
//                     mediaIds = await Promise.all(
//                         images.map(image =>
//                             uploadMediaToTwiiter({ media: image, oauth_token: twitterAccount.access_token!, oauth_token_secret: twitterAccount.access_token_secret! })
//                         )
//                     );
//                 }

//                 console.log({
//                     text: postText,
//                     mediaIds,
//                     oauth_token: twitterAccount.access_token!,
//                     oauth_token_secret: twitterAccount.access_token_secret!
//                 });

//                 // Create the Twitter post
//                 const postResponse = await createTweet({ text: postText, mediaIds, oauth_token: twitterAccount.access_token!, oauth_token_secret: twitterAccount.access_token_secret! });
//                 console.log("PostResponse:", postResponse);

//                 if (postResponse.error) {
//                     return { provider: "twitter", error: postResponse.error };
//                 }

//                 const postSave = await postSaveToDB({ postText, userId: loggedUser.id, provider: "twitter" });
//                 console.log("Post saved to DB:", postSave);

//                 return { provider: "twitter", response: postResponse };
//             } catch (error: any) {
//                 console.error("Twitter posting error:", error);
//                 return { provider: "twitter", error: error.message || "An error occurred" };

//             }
//         }
//         if (provider === "instagram") {
//             // Create the Instagram post
//             return { provider, response: null };
//         }
//         if (provider === "threads") {
//             // Create the Threads post
//             return { provider, response: null };
//         }
//         return { provider, response: null };
//     })
// );
// return NextResponse.json({ success: true, results });
