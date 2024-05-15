import {NextRequest, NextResponse} from "next/server";
import {
  AgentRuntimeError,
  AgentRuntimeErrorType,
  ModelProvider
} from "@/libs/agent-runtime";
import {chatClient} from "../clients";

export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    inputs = {},
    stream = true,
    conversation_id = '',
    user = "",
    query = '',
    files = null,
    datasets = [],
    app,
  } = body;

  if (app?.appKey) {
    chatClient.updateApiKey(app.appKey);
  }

  return chatClient.createChatMessage(
    {
      inputs,
      query,
      user,
      stream,
      conversation_id,
      files,
      dataset_ids: datasets,
    }
  ).then((resp) => {
    return new Response(resp.data);
  }).catch((error) => {
    const errorResult = {
      cause: error.data,
      message: error.message,
      name: error.name,
      stack: error.stack,
    };

    const errorType = AgentRuntimeErrorType.QwenBizError;
    throw AgentRuntimeError.chat({
      endpoint: '/api/dify/chat',
      error: errorResult,
      errorType,
      provider: ModelProvider.Moonshot,
    });
  });
}