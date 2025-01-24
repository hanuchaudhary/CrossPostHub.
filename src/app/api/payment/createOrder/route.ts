import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const key_id = process.env.RAZORPAY_KEY_ID as string;
const key_secret = process.env.RAZORPAY_KEY_SECRET as string;

if (!key_id || !key_secret) {
    throw new Error("Razorpay keys are missing");
}

const razorpay = new Razorpay({
    key_id,
    key_secret
})

export type OrderBody = {
    amount: number;
    currency: string;
}

export async function POST(request: NextRequest) {
    try {

        const { amount, currency }: OrderBody = await request.json();

        const options = {
            amount,
            currency: currency || "INR",
            receipt: `receipt#${Date.now()}`,
        }

        const order = await razorpay.orders.create(options);
        if (!order) {
            return NextResponse.json({ message: "Failed to create order" }, { status: 500 })
        }

        return NextResponse.json({ order }, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: "Server Error" }, { status: 500 })
    }
}