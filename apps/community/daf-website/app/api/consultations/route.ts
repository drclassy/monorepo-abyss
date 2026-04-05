import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { consultationSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = consultationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validasi gagal", details: result.error.flatten() },
        { status: 400 },
      );
    }

    // Save to database
    const consultation = await prisma.consultation.create({
      data: result.data,
    });

    // TODO: Send email notification (implement with nodemailer or similar)
    // await sendNotificationEmail(result.data);

    return NextResponse.json(
      {
        success: true,
        message: "Permintaan konsultasi berhasil dikirim",
        data: consultation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Consultation submission error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}

// For admin dashboard (protected route)
export async function GET(request: NextRequest) {
  try {
    // Check admin API key
    const authHeader = request.headers.get("authorization");
    const apiKey = authHeader?.replace("Bearer ", "");
    if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const consultations = await prisma.consultation.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: consultations });
  } catch (error) {
    console.error("Fetch consultations error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
