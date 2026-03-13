import { chatWithAgent } from "@/lib/ai/portfolioAgent";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages, portfolioContext } = await req.json();
    const response = await chatWithAgent(messages, portfolioContext);
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error.status === 429) {
      return Response.json(
        { error: "사용량 초과. 잠시 후 다시 시도하세요" },
        { status: 429 },
      );
    } else {
      return NextResponse.json({ error: "채팅 실패" }, { status: 500 });
    }
  }
}
