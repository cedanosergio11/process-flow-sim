import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { APP_VERSION, CHANGELOG } from "@/lib/version";

export function ChangelogDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="rounded-sm px-1.5 py-0.5 font-mono text-xs text-faint transition-colors duration-150 hover:bg-subtle hover:text-fg"
          aria-label="Version changelog"
        >
          v{APP_VERSION}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/70" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(32rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-surface p-5 text-fg shadow-[var(--shadow-border)]">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-sm font-semibold tracking-tight">
                Changelog
              </Dialog.Title>
              <Dialog.Description className="text-xs text-muted">
                Stasis Dual Choke  ·  v{APP_VERSION}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex size-11 items-center justify-center rounded-sm text-muted hover:bg-subtle hover:text-fg"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </Dialog.Close>
          </div>
          <ol className="max-h-[min(24rem,60dvh)] space-y-4 overflow-y-auto pr-1">
            {CHANGELOG.map((entry) => (
              <li key={entry.version} className="border-t border-border pt-3">
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <p className="font-mono text-sm text-fg">{entry.version}</p>
                  <p className="text-xs text-faint">{entry.date}</p>
                </div>
                <p className="mb-1.5 text-sm text-muted">{entry.title}</p>
                <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted">
                  {entry.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
