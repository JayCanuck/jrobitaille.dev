import { tagClass } from '@/components/ui/chip';
import { siteCopy } from '@/content/site';

// The "Agent tools available" chip (D17), rendered by the island only after registration
// succeeds. A native popover toggletip carries the explanation: no Base UI JavaScript, keyboard
// operable (Enter toggles, Escape closes), top layer so it shifts nothing.
export function AgentToolsBadge() {
  return (
    <>
      <button
        type="button"
        popoverTarget="agent-tools-help"
        className={`${tagClass} cursor-pointer hover:bg-brand-soft hover:text-brand-text focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none`}
      >
        {siteCopy.agentTools.badge}
      </button>
      <div
        id="agent-tools-help"
        popover="auto"
        className="max-w-[44ch] rounded-xl border bg-card p-4 text-left font-sans text-small text-foreground shadow-md"
      >
        {siteCopy.agentTools.explain}
      </div>
    </>
  );
}
