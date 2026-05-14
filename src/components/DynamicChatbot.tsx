"use client";

import dynamic from "next/dynamic";

export const DynamicChatbot = dynamic(() => import("@/components/chatbot/Chatbot").then((m) => ({ default: m.Chatbot })), {
  ssr: false,
  loading: () => null,
});
