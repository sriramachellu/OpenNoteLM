import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) {
            return NextResponse.json({ error: "No file uploaded", ok: false }, { status: 400 });
        }

        const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB to fit within Vercel's 4.5MB Serverless ingress limit
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File exceeds 4MB Vercel serverless size limit.", ok: false }, { status: 413 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const tempDir = path.join(process.cwd(), "tmp");
        await fs.mkdir(tempDir, { recursive: true });

        const tempFilePath = path.join(tempDir, `${uuidv4()}.pdf`);
        await fs.writeFile(tempFilePath, buffer);

        // Determine Python path (assumes .venv is present and active OR mapped)
        const pythonPath = process.platform === "win32"
            ? path.join(process.cwd(), "..", ".venv", "Scripts", "python.exe")
            : path.join(process.cwd(), "..", ".venv", "bin", "python");

        const scriptPath = path.join(process.cwd(), "api", "extract.py");

        console.log("[API Extract] Starting extraction...");
        console.log("[API Extract] Python Path:", pythonPath);
        console.log("[API Extract] Script Path:", scriptPath);
        console.log("[API Extract] Temp File:", tempFilePath);

        return new Promise<NextResponse>((resolve) => {
            const py = spawn(pythonPath, [scriptPath, tempFilePath]);
            let output = "";
            let error = "";

            py.stdout.on("data", (data) => {
                output += data.toString();
            });

            py.stderr.on("data", (data) => {
                console.error("[API Extract Python Error]:", data.toString());
                error += data.toString();
            });

            py.on("error", (err) => {
                console.error("[API Extract Spawn Error]:", err);
                resolve(NextResponse.json({ error: `Spawn failed: ${err.message}`, ok: false }, { status: 500 }));
            });

            py.on("close", async (code) => {
                console.log("[API Extract] Python process closed with code", code);
                await fs.unlink(tempFilePath).catch(e => console.error("Temp cleanup failed:", e));

                if (code !== 0) {
                    resolve(NextResponse.json({ error: `Python exited with code ${code}: ${error}`, ok: false }, { status: 500 }));
                    return;
                }

                try {
                    const match = output.match(/---JSON_START---([\s\S]*?)---JSON_END---/);
                    if (match && match[1]) {
                        const result = JSON.parse(match[1]);
                        resolve(NextResponse.json(result));
                    } else {
                        throw new Error("Missing JSON delimiter in output");
                    }
                } catch (e: any) {
                    console.error("[API Extract Parse Error]. Output:", output);
                    const snippet = output.length > 500 ? output.substring(0, 500) + "..." : output;
                    resolve(NextResponse.json({
                        error: `Parse error: ${e.message}. Raw output snippet: ${snippet}`,
                        ok: false
                    }, { status: 500 }));
                }
            });
        });

    } catch (e: any) {
        console.error("[API Extract Global Error]:", e);
        return NextResponse.json({ error: e.message, ok: false }, { status: 500 });
    }
}
