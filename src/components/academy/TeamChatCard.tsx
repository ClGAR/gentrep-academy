"use client";

import { TelegramIcon } from "@/components/academy/TelegramIcon";

export function TeamChatCard({ teamName }: { teamName: string }) {
  return (
    <div className="chat soon" role="status">
      <span className="tg">
        <TelegramIcon />
      </span>
      <span className="grow left">
        <span className="soon-tag">Coming soon</span>
        <b>{teamName} chat</b>
        <em>Telegram group chat. Not open yet.</em>
      </span>
    </div>
  );
}
