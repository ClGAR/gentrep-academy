"use client";

import { TelegramIcon } from "@/components/academy/TelegramIcon";

export function TeamChatCard({
  teamName,
  memberCount,
  onOpen,
}: {
  teamName: string;
  memberCount: number;
  onOpen: () => void;
}) {
  return (
    <button className="tap chat" onClick={onOpen}>
      <span className="tg">
        <TelegramIcon />
      </span>
      <span className="grow left">
        <b>{teamName} chat</b>
        <em>
          {memberCount} members · ask before you go
        </em>
      </span>
    </button>
  );
}
