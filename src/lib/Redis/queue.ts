import { Queue, Worker, Job } from "bullmq";
import { CreatePostWithMedia, CreateTextPost, registerAndUploadMedia } from "@/utils/LinkedInUtils/LinkedinUtils";
import { createTweet, uploadMediaToTwiiter } from "@/utils/TwitterUtils/TwitterUtils";

// Redis connection configuration
const connection = { host: "localhost", port: 6379 };

// Queue instance
export const postQueue = new Queue("postQueue", { connection });

const PublishPostWorker = new Worker(
    "postQueue",
    async (job: Job) => {
        try {
            const { provider, postText, images, loggedUser } = job.data;

            console.log("Processing Job:", {
                provider,
                postText,
                imagesCount: images.length,
                loggedUserId: loggedUser.id,
                images
            });

            if (provider === "linkedin") {
                const linkedinAccount = loggedUser.accounts.find((acc: any) => acc.provider === "linkedin");
                if (!linkedinAccount) throw new Error("LinkedIn account not found for the logged user.");

                if (images.length === 0) {
                    console.log("Creating a LinkedIn text post...");
                    const result = await CreateTextPost({
                        accessToken: linkedinAccount.access_token!,
                        personURN: linkedinAccount.providerAccountId!,
                        text: postText,
                    });
                    console.log("LinkedIn Text Post created:", result);
                    return result;
                }

                console.log("Uploading images to LinkedIn...");
                const assetURNs = await Promise.all(
                    images.map((image: any) =>
                        registerAndUploadMedia({
                            accessToken: linkedinAccount.access_token!,
                            personURN: linkedinAccount.providerAccountId!,
                            image,
                        })
                    )
                );
                console.log("Asset URNs obtained:", assetURNs);

                console.log("Creating LinkedIn post with media...");
                const result = await CreatePostWithMedia({
                    accessToken: linkedinAccount.access_token!,
                    personURN: linkedinAccount.providerAccountId!,
                    assetURNs,
                    text: postText,
                });
                console.log("LinkedIn Post with Media created:", result);
                return result;
            }

            if (provider === "twitter") {
                const twitterAccount = loggedUser.accounts.find((acc: any) => acc.provider === "twitter");
                if (!twitterAccount) throw new Error("Twitter account not found for the logged user.");

                console.log("Uploading images to Twitter...");
                if (images.length === 0) {
                    console.log("Creating a Tweet without media...");
                    const result = await createTweet({
                        text: postText,
                        mediaIds: [],
                        oauth_token: twitterAccount.access_token!,
                        oauth_token_secret: twitterAccount.access_token_secret!,
                    });
                    console.log("Tweet without Media created:", result);
                    return result;
                } else {
                    const mediaIds = await Promise.all(
                        images.map((image: any) =>
                            uploadMediaToTwiiter({
                                media: image,
                                oauth_token: twitterAccount.access_token!,
                                oauth_token_secret: twitterAccount.access_token_secret!,
                            })
                        )
                    );
                    console.log("Media IDs obtained for Twitter:", mediaIds);

                    console.log("Creating Tweet with media...");
                    const result = await createTweet({
                        text: postText,
                        mediaIds,
                        oauth_token: twitterAccount.access_token!,
                        oauth_token_secret: twitterAccount.access_token_secret!,
                    });
                    console.log("Tweet with Media created:", result);
                    return result;
                }
            }

            throw new Error(`Unsupported provider: ${provider}`);
        } catch (error) {
            console.error(`Job failed for provider: ${job.data.provider}`, error);
            throw error;
        }
    },
    { connection }
);

// Event listener for successful job completion
PublishPostWorker.on("completed", (job: Job) => {
    console.log(`Job completed successfully:`, {
        jobId: job.id,
        returnValue: job.returnvalue,
    });
});

// Event listener for job failure
PublishPostWorker.on("failed", (job: Job | undefined, error: Error) => {
    if (job) {
        console.error(`Job failed:`, {
            jobId: job.id,
            error: error.message,
        });
    } else {
        console.error("Job failed but job is undefined:", error);
    }
});

