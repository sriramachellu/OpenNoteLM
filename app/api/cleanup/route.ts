import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    try {
        const { sessionId } = await req.json();
        if (!sessionId || typeof sessionId !== "string") {
            return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
        }

        await convex.mutation(api.mutations.wipeAllData, { sessionId });
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        console.error("[API Cleanup]", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
