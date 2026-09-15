// app/api/onboarding/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL || process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL;

        if (!webhookUrl) {
            console.error("Missing DISCORD_WEBHOOK_URL in environment variables.");
            return NextResponse.json(
                { error: "Server configuration error: Webhook URL not configured." },
                { status: 500 }
            );
        }

        // Forward the multipart/form-data directly to Discord
        const formData = await req.formData();

        const discordRes = await fetch(webhookUrl, {
            method: "POST",
            body: formData,
        });

        if (!discordRes.ok) {
            const errorText = await discordRes.text();
            console.error("Discord API Error:", errorText);
            return NextResponse.json(
                { error: `Discord rejected webhook: ${discordRes.status}` },
                { status: discordRes.status }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Onboarding API Error:", error);
        return NextResponse.json(
            { error: error?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}