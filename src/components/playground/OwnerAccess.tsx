import React from "react";
import { ChevronDown, Fingerprint, Plus, ShieldCheck } from "lucide-react";
import {
  startAuthentication,
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON
} from "@simplewebauthn/browser";

type OwnerCredential = { id: string; createdAt: number };
type OwnerStatus = { owner: boolean; expiresAt?: number; credentials?: OwnerCredential[] };

type OwnerAccessProps = {
  onOwnerChange: (owner: boolean) => void;
  visitorStatus: string;
};

const buttonClass = "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--mid)] transition-colors hover:bg-black/[0.04] hover:text-[var(--ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const primaryButtonClass = `${buttonClass} bg-[var(--ink)] text-white hover:bg-stone-700 hover:text-white`;

async function post<T>(action: string, values: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch("/api/owner-access", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action, ...values })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) {
    throw new Error(typeof result?.error === "string" ? result.error : "Owner access is temporarily unavailable. Please try again later.");
  }
  return result as T;
}

function assertPasskeySupport() {
  if (!window.isSecureContext) {
    throw new Error("Open this website over HTTPS to use your passkey.");
  }
  if (!window.PublicKeyCredential) {
    throw new Error("This browser does not support passkeys. Try an up-to-date browser on your phone or computer.");
  }
}

function errorMessage(error: unknown) {
  if (error instanceof Error && (error.name === "NotAllowedError" || error.name === "AbortError")) {
    return "The passkey request was cancelled or timed out.";
  }
  return error instanceof Error ? error.message : "Unable to complete owner access. Please try again.";
}

function credentialsFrom(status: OwnerStatus): OwnerCredential[] | null {
  if (!status.owner) return [];
  if (!Array.isArray(status.credentials)) return null;
  return status.credentials.filter((credential) => typeof credential.id === "string" &&
    typeof credential.createdAt === "number" && Number.isFinite(credential.createdAt));
}

export function OwnerAccess({ onOwnerChange, visitorStatus }: OwnerAccessProps) {
  const [owner, setOwner] = React.useState(false);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [inviteToken, setInviteToken] = React.useState<string | null>(null);
  const [confirmRevoke, setConfirmRevoke] = React.useState(false);
  const [credentials, setCredentials] = React.useState<OwnerCredential[] | null>(null);
  const [managePasskeys, setManagePasskeys] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState<string | null>(null);
  const actionRunning = React.useRef(false);
  const requestVersion = React.useRef(0);
  const panelId = React.useId();

  React.useEffect(() => {
    function captureInvitation() {
      const fragment = new URLSearchParams(window.location.hash.slice(1));
      if (!fragment.has("owner-invite")) return;
      const token = fragment.get("owner-invite");
      // Remove the invitation before contacting any endpoint. Keep it only in
      // component memory, never history state, browser storage, or logs.
      fragment.delete("owner-invite");
      const remaining = fragment.toString();
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${window.location.search}${remaining ? `#${remaining}` : ""}`);
      setNotice(null);
      if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) {
        setInviteToken(token);
        setError(null);
      } else {
        setInviteToken(null);
        setError("This owner invitation is invalid. Request a fresh invitation link.");
      }
    }
    captureInvitation();
    // An invitation can open in a tab already showing the playground. In that
    // case only the fragment changes and React keeps this component mounted.
    window.addEventListener("hashchange", captureInvitation);
    window.addEventListener("popstate", captureInvitation);
    return () => {
      window.removeEventListener("hashchange", captureInvitation);
      window.removeEventListener("popstate", captureInvitation);
    };
  }, []);

  React.useEffect(() => {
    const controller = new AbortController();
    async function refreshStatus() {
      if (actionRunning.current) return;
      const version = ++requestVersion.current;
      try {
        const response = await fetch("/api/owner-access", {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal
        });
        if (!response.ok) return;
        const status = await response.json() as OwnerStatus;
        if (typeof status.owner !== "boolean" || version !== requestVersion.current || controller.signal.aborted) return;
        setOwner(status.owner);
        setCredentials(credentialsFrom(status));
        onOwnerChange(status.owner);
      } catch {
        // Public visitors can use the editor even if owner access is not
        // configured. Report availability errors only after an explicit action.
      }
    }
    void refreshStatus();
    const onFocus = () => { void refreshStatus(); };
    window.addEventListener("focus", onFocus);
    return () => {
      controller.abort();
      window.removeEventListener("focus", onFocus);
    };
  }, [onOwnerChange]);

  async function perform(action: "authenticate" | "register" | "logout" | "revoke-all" | "remove-passkey", credentialId?: string) {
    if (actionRunning.current) return;
    actionRunning.current = true;
    const version = ++requestVersion.current;
    setBusy(action);
    setError(null);
    setNotice(null);
    let invitationMayBeConsumed = false;
    try {
      let status: OwnerStatus;
      if (action === "authenticate") {
        assertPasskeySupport();
        const { options } = await post<{ options: PublicKeyCredentialRequestOptionsJSON }>("authenticate-options");
        const response = await startAuthentication({ optionsJSON: options });
        status = await post<OwnerStatus>("authenticate-verify", { response });
      } else if (action === "register") {
        assertPasskeySupport();
        const token = inviteToken;
        if (token) {
          // Even a network error could occur after the server consumes it.
          // Do not silently reuse a potentially spent invitation.
          invitationMayBeConsumed = true;
          setInviteToken(null);
        }
        const { options } = await post<{ options: PublicKeyCredentialCreationOptionsJSON }>("register-options", token ? { inviteToken: token } : {});
        const response = await startRegistration({ optionsJSON: options });
        status = await post<OwnerStatus>("register-verify", { response });
      } else {
        status = await post<OwnerStatus>(action, credentialId ? { credentialId } : {});
      }
      if (typeof status.owner !== "boolean") throw new Error("Owner access returned an invalid response. Please try again.");
      if (status.owner && (action === "register" || action === "authenticate")) {
        // Authentication already succeeded. A failed list refresh must not
        // turn it into an apparent sign-in failure or reuse an invitation.
        try {
          const response = await fetch("/api/owner-access", { credentials: "same-origin", cache: "no-store" });
          if (response.ok) {
            const refreshed = await response.json() as OwnerStatus;
            if (typeof refreshed.owner === "boolean" && version === requestVersion.current) status = refreshed;
          }
        } catch {
          // Keep the successful authentication result and refresh on focus.
        }
      }
      if (version !== requestVersion.current) return;
      setOwner(status.owner);
      setCredentials(credentialsFrom(status));
      onOwnerChange(status.owner);
      setConfirmRevoke(false);
      setConfirmRemove(null);
      if (action === "remove-passkey") {
        setNotice(status.owner
          ? "Passkey removed. Browsers authorized with it have lost owner access."
          : "Passkey removed. This browser has lost owner access. Use another registered passkey or a private setup link to restore access.");
      } else if (status.owner) {
        setNotice(action === "register" ? "Passkey saved. This browser now has owner access." : "Owner access restored on this browser.");
      } else if (action === "revoke-all") {
        setNotice("All browsers have been signed out. Your registered passkeys can still restore owner access.");
      } else {
        setNotice("Owner access has been removed from this browser.");
      }
    } catch (caught) {
      setError(`${errorMessage(caught)}${invitationMayBeConsumed ? " This invitation may have been used. Request a fresh link to finish setup." : ""}`);
    } finally {
      actionRunning.current = false;
      setBusy(null);
    }
  }

  return (
    <div className="space-y-3 text-xs" aria-label="Owner access">
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1 text-[var(--mid)]" role="status">
          {owner ? (
            <>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--hairline)] bg-[var(--plinth)] px-2.5 py-1 font-medium text-[var(--ink)]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                Owner
              </span>
              <span>No daily generation limit</span>
            </>
          ) : <span className="leading-relaxed">{visitorStatus}</span>}
        </div>
        {owner ? (
          <button
            type="button"
            className={`${buttonClass} shrink-0`}
            disabled={busy !== null}
            aria-expanded={managePasskeys}
            aria-controls={panelId}
            onClick={() => {
              setManagePasskeys((value) => !value);
              setConfirmRevoke(false);
              setConfirmRemove(null);
            }}
          >
            Manage access
            <ChevronDown className={`h-3.5 w-3.5 transition-transform motion-reduce:transition-none ${managePasskeys ? "rotate-180" : ""}`} aria-hidden />
          </button>
        ) : !inviteToken ? (
          <button type="button" className={`${buttonClass} shrink-0`} disabled={busy !== null} onClick={() => { void perform("authenticate"); }}>
            <Fingerprint className="h-3.5 w-3.5" aria-hidden />
            {busy === "authenticate" ? "Checking passkey…" : "Owner access"}
          </button>
        ) : null}
      </div>

      {inviteToken ? (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--plinth)] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--ink)]">Your owner invitation is ready</p>
            <p className="max-w-lg leading-relaxed text-[var(--mid)]">Save a passkey to generate without the daily limit. Your device will ask you to confirm.</p>
          </div>
          <button type="button" className={`${primaryButtonClass} shrink-0 self-start sm:self-auto`} disabled={busy !== null} onClick={() => { void perform("register"); }}>
            <Fingerprint className="h-4 w-4" aria-hidden />
            Set up owner passkey
          </button>
        </div>
      ) : null}
      {busy === "register" && !owner ? <p className="px-4 leading-relaxed text-[var(--mid)]" role="status">Follow your device’s prompt to save your owner passkey…</p> : null}

      {managePasskeys && owner ? (
        <section id={panelId} aria-label="Manage owner access" className="overflow-hidden rounded-xl border border-[var(--hairline)] bg-[var(--plinth)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--hairline)] px-4 py-3">
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-[var(--ink)]">Passkeys</h3>
              <p className="leading-relaxed text-[var(--mid)]">Use a saved passkey to restore owner access on your devices.</p>
            </div>
            <button type="button" className={`${buttonClass} border border-[var(--hairline)] bg-[var(--card)]`} disabled={busy !== null} onClick={() => { void perform("register"); }}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {busy === "register" ? "Saving…" : "Add passkey"}
            </button>
          </div>
          <div className="divide-y divide-[var(--hairline)] px-4">
            {credentials === null ? <p className="py-4 leading-relaxed text-[var(--mid)]">Passkeys could not be loaded. Reload the page to try again.</p> : null}
            {credentials?.length === 0 ? <p className="py-4 text-[var(--mid)]">No passkeys are registered.</p> : null}
            {credentials?.map((credential) => (
              <div key={credential.id} className="space-y-2 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Fingerprint className="h-4 w-4 shrink-0 text-[var(--mid)]" aria-hidden />
                    <div className="min-w-0 space-y-0.5">
                      <p className="font-medium text-[var(--ink)]">Owner passkey</p>
                      <p className="leading-relaxed text-[var(--mid)]">Added {new Date(credential.createdAt).toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                      {credentials.length > 1 ? <p className="font-mono text-[10px] text-[var(--mid)]">{credential.id.slice(0, 8)}…</p> : null}
                    </div>
                  </div>
                  <button type="button" className={`${buttonClass} shrink-0`} disabled={busy !== null} onClick={() => { setConfirmRemove(credential.id); setConfirmRevoke(false); }}>Remove</button>
                </div>
                {confirmRemove === credential.id ? (
                  <div className="space-y-2 rounded-lg border border-[var(--hairline)] bg-[var(--card)] p-3">
                    <p className="leading-relaxed text-[var(--mid)]">Browsers using this passkey will lose owner access. If it’s your last passkey, you’ll need a new private invitation.</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={`${buttonClass} text-rose-700 hover:text-rose-800`} disabled={busy !== null} onClick={() => { void perform("remove-passkey", credential.id); }}>
                        {busy === "remove-passkey" ? "Removing…" : "Remove passkey"}
                      </button>
                      <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => setConfirmRemove(null)}>Keep passkey</button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-[var(--hairline)] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[var(--mid)]">Signing out keeps your saved passkeys.</p>
              <div className="flex flex-wrap gap-1">
                <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => { void perform("logout"); }}>
                  {busy === "logout" ? "Signing out…" : "Sign out"}
                </button>
                <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => { setConfirmRevoke(true); setConfirmRemove(null); }}>
                  Sign out all browsers
                </button>
              </div>
            </div>
            {confirmRevoke ? (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--hairline)] bg-[var(--card)] p-3">
                <p className="leading-relaxed text-[var(--mid)]">Sign out every browser? Your passkeys will still work.</p>
                <div className="flex gap-1">
                  <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => { void perform("revoke-all"); }}>
                    {busy === "revoke-all" ? "Signing out…" : "Sign out all"}
                  </button>
                  <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => setConfirmRevoke(false)}>Cancel</button>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
      {notice ? <p className="px-4 leading-relaxed text-[var(--mid)]" role="status">{notice}</p> : null}
      {error ? <p className="px-4 leading-relaxed text-rose-600" role="alert">{error}</p> : null}
    </div>
  );
}
