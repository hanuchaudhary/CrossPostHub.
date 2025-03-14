import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/config/prismaConfig";
import { getTwitterUserDetails } from "@/utils/TwitterUtils/TwitterUtils";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const twitterAccount = user.accounts.find(
      (account) => account.provider === "twitter"
    );
    if (!twitterAccount) {
      return NextResponse.json(
        { error: "Twitter account not found" },
        { status: 404 }
      );
    }

    const twitterUserDetails = await getTwitterUserDetails({
      oauth_token: twitterAccount?.access_token as string,
      oauth_token_secret: twitterAccount?.access_token_secret as string,
    });

    return NextResponse.json({ twitterUserDetails }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const posts = await prisma.post.findMany({
      where: { userId: session.user.id },
      select: {
        createdAt: true,
        provider: true,
      },
    });

    console.log("Posts:", posts);
    
    // Define a type for the provider keys
    type Provider = "twitter" | "linkedin" | "instagram";

    // Initialize a map to store the aggregated data
    const monthlyData: {
      [key: string]: {
        month: string;
        twitter: number;
        linkedin: number;
        instagram: number;
      };
    } = {};

    // Iterate through the posts and aggregate the data
    posts.forEach((post) => {
      const month = post.createdAt.toLocaleString("default", {
        month: "short",
      });
      const provider = (post.provider!.charAt(0) +
        post.provider!.slice(1)) as Provider;

      if (!monthlyData[month]) {
        monthlyData[month] = { month, twitter: 0, linkedin: 0, instagram: 0 };
      }

      if (monthlyData[month][provider] !== undefined) {
        monthlyData[month][provider] += 1;
      }
    });

    // Convert the map to an array of objects
    const result = Object.values(monthlyData);

    console.log("Result:", result);
    

    return NextResponse.json( result , { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
