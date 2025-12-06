import { NextResponse, NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";


export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { message: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify signature
    const bodyData = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(bodyData.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      // Log failed attempt
      await prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: { status: "failed" },
      });
      return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
    }

    // Payment is successful
    // 1. Update Payment status
    // 2. Add credits to user
    
    // We fetch the payment to know how many credits to add
    const paymentRecord = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!paymentRecord) {
        return NextResponse.json({ message: "Payment record not found" }, { status: 404 });
    }

    // Use transaction to ensure both happen or neither
    await prisma.$transaction([
      prisma.payment.update({
        where: { razorpayOrderId: razorpay_order_id },
        data: { 
            status: "success",
            razorpayPaymentId: razorpay_payment_id
        },
      }),
      prisma.user.update({
        where: { email: session.user.email },
        data: { credits: { increment: paymentRecord.creditsPurchased } },
      }),
    ]);

    return NextResponse.json(
      { message: "Payment verified and credits added" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}