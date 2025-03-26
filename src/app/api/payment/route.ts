import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import prisma from "@/config/prismaConfig";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const transactions = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        transactions: true,
      },
    });

    return NextResponse.json({ transactions :  transactions?.transactions }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { order_id } = await request.json();

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: order_id },
      select: {
        id: true,

        createdAt: true,
        status: true,
        order_id: true,
        paymentId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ transaction }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch transaction" },
      { status: 500 }
    );
  }
}
