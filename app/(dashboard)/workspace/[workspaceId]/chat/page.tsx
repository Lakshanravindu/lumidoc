import { MessageSquarePlus } from "lucide-react";

export default function WorkspaceChatPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-paper-faint select-none">
      <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/25 flex items-center justify-center">
        <MessageSquarePlus size={28} className="text-gold" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-paper-dim">No conversation selected</p>
        <p className="text-xs text-paper-faint mt-1">
          Click &ldquo;New Chat&rdquo; to start asking questions
        </p>
      </div>
    </div>
  );
}
