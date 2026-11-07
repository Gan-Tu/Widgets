import React from "react";
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
};

const buttonClass = "rounded-md px-2 py-1 text-xs text-[var(--mid)] underline-offset-4 hover:text-[var(--ink)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

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

export function OwnerAccess({ onOwnerChange }: OwnerAccessProps) {
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
    <div className="space-y-1 text-xs" aria-label="Owner access">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {owner ? (
          <>
            <span className="text-[var(--mid)]">Owner access active · visitor limits waived</span>
            <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => { void perform("register"); }}>
              {busy === "register" ? "Saving passkey…" : "Add passkey"}
            </button>
            <button type="button" className={buttonClass} disabled={busy !== null} aria-expanded={managePasskeys} onClick={() => setManagePasskeys((value) => !value)}>
              Manage passkeys
            </button>
            <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => { void perform("logout"); }}>
              {busy === "logout" ? "Signing out…" : "Sign out"}
            </button>
            <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => setConfirmRevoke(true)}>
              Sign out all browsers
            </button>
          </>
        ) : (
          <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => { void perform("authenticate"); }}>
            {busy === "authenticate" ? "Checking passkey…" : "Owner access"}
          </button>
        )}
        {inviteToken ? (
          <button type="button" className={`${buttonClass} font-medium`} disabled={busy !== null} onClick={() => { void perform("register"); }}>
            Set up owner passkey
          </button>
        ) : null}
      </div>
      {inviteToken ? (
        <p className="text-[var(--mid)]">Use this private invitation to save your owner passkey. Setup uses the invitation once; cancelling requires a fresh link.</p>
      ) : null}
      {busy === "register" && !owner ? <p className="text-[var(--mid)]" role="status">Follow your device’s prompt to save your owner passkey…</p> : null}
      {confirmRevoke && owner ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--hairline)] p-2">
          <span>Sign out every browser? Your passkeys will still work.</span>
          <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => { void perform("revoke-all"); }}>
            {busy === "revoke-all" ? "Signing out…" : "Sign out all"}
          </button>
          <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => setConfirmRevoke(false)}>Cancel</button>
        </div>
      ) : null}
      {managePasskeys && owner ? (
        <div className="space-y-2 rounded-lg border border-[var(--hairline)] p-3">
          <p className="font-medium text-[var(--ink)]">Owner passkeys</p>
          {credentials === null ? <p className="text-[var(--mid)]">Passkeys could not be loaded. Reload the page to try again.</p> : null}
          {credentials?.length === 0 ? <p className="text-[var(--mid)]">No passkeys are registered.</p> : null}
          {credentials?.map((credential) => (
            <div key={credential.id} className="space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p>Passkey added {new Date(credential.createdAt).toLocaleString([], { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                  {credentials.length > 1 ? <p className="text-[var(--mid)]">ID {credential.id.slice(0, 8)}…</p> : null}
                </div>
                <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => setConfirmRemove(credential.id)}>Remove</button>
              </div>
              {confirmRemove === credential.id ? (
                <div className="space-y-1 rounded-md border border-[var(--hairline)] p-2">
                  <p>Browsers authorized with this passkey will lose access. If this is your last passkey, you will need a private setup link.</p>
                  <div className="flex gap-2">
                    <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => { void perform("remove-passkey", credential.id); }}>
                      {busy === "remove-passkey" ? "Removing…" : "Remove passkey"}
                    </button>
                    <button type="button" className={buttonClass} disabled={busy !== null} onClick={() => setConfirmRemove(null)}>Cancel</button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {notice ? <p className="text-[var(--mid)]" role="status">{notice}</p> : null}
      {error ? <p className="text-rose-600" role="alert">{error}</p> : null}
    </div>
  );
}
