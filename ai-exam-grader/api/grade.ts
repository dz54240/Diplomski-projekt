import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    try {
        const { submission, rubric } = req.body;

        const schema = {
            type: "object",
            additionalProperties: false,
            properties: {
                total: { type: "number" },
                perCriterion: {
                    type: "array",
                    items: {
                        type: "object",
                        additionalProperties: false,
                        properties: {
                            id: { type: "string" },
                            points: { type: "number" },
                            feedback: { type: "string" }
                        },
                        required: ["id", "points", "feedback"]
                    }
                },
                feedbackSummary: { type: "string" }
            },
            required: ["total", "perCriterion", "feedbackSummary"]
        };

        const upstream = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-5-nano",
                input: [
                    { role: "system", content: "You are an impartial exam grader. Score strictly by rubric and return ONLY JSON." },
                    { role: "user", content: JSON.stringify({ rubric, answers: submission?.answers ?? "" }) }
                ],
                text: {
                    format: {
                        type: "json_schema",
                        name: "grading_result",
                        schema
                    }
                }
            }),
        });

        if (!upstream.ok) {
            const errText = await upstream.text();
            return res.status(upstream.status).send(errText);
        }

        const data = await upstream.json();
        let payload: any = null;

        if (data.output_parsed) {
            payload = data.output_parsed;
        } else {
            const outputs = Array.isArray(data.output) ? data.output : [];
            const firstMsg = outputs.find((o: any) => o?.type === "message");
            const content = Array.isArray(firstMsg?.content) ? firstMsg.content : [];
            const textPart = content.find((c: any) => c?.type === "output_text");
            if (textPart?.text) {
                try {
                    payload = JSON.parse(textPart.text);
                } catch {
                    return res.status(200).json({ raw: textPart.text });
                }
            }
        }

        if (!payload) {
            return res.status(200).json({ rawResponse: data });
        }

        return res.status(200).json(payload);

    } catch (e: any) {
        console.error(e);
        return res.status(500).json({ error: e?.message || "Server error" });
    }
}
