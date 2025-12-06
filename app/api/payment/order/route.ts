import { NextResponse } from "next/server";
import {auth} from "@/auth"
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Configuration for the credit package
    const CREDIT_AMOUNT = 10; // Number of credits to add
    const AMOUNT_INR = 99; // Price in INR
    const amountInPaise = AMOUNT_INR * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: user.id,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save initial payment record
    await prisma.payment.create({
      data: {
        razorpayOrderId: order.id,
        amount: amountInPaise,
        status: "pending",
        userId: user.id,
        creditsPurchased: CREDIT_AMOUNT,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: amountInPaise,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}