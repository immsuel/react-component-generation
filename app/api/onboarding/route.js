// app/api/onboarding/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const formData = await req.formData();

        const response = await fetch(process.env.DISCORD_WEBHOOK_URL, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            return NextResponse.json({ error: "Failed to post to Discord" }, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}