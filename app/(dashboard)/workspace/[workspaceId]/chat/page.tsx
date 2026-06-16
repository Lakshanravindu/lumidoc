import { MessageSquarePlus } from "lucide-react";

export default function WorkspaceChatPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-500 select-none">
      <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
        <MessageSquarePlus size={28} className="text-zinc-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-400">No conversation selected</p>
        <p className="text-xs text-zinc-600 mt-1">
          Click &ldquo;New Chat&rdquo; to start asking questions
        </p>
      </div>
    </div>
  );
}
