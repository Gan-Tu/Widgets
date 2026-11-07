import { createOwnerInvite, listOwnerCredentials, revokeAllOwnerSessions, revokeOwnerCredential } from "../api/_lib/owner-auth.js";

// Run with server environment variables, e.g.:
// node --env-file=.env.local scripts/owner-access.mjs invite
// Invitations are bearer secrets: output only the fresh link, never save it.
try {
  const [action, credentialId, ...extra] = process.argv.slice(2);
  if (extra.length || (action !== "revoke-passkey" && credentialId)) throw new Error("Unexpected arguments.");
  switch (action) {
    case "invite": {
      const invite = await createOwnerInvite();
      console.log(invite.url);
      console.error("This private setup link expires in 10 minutes and can be opened once. It permits registering an owner passkey.");
      break;
    }
    case "list": console.log(JSON.stringify(await listOwnerCredentials(), null, 2)); break;
    case "revoke-all":
      await revokeAllOwnerSessions();
      console.log("All owner browser sessions and outstanding setup attempts have been revoked. Existing passkeys can authorize again.");
      break;
    case "revoke-passkey":
      if (!credentialId) throw new Error("A passkey ID is required.");
      await revokeOwnerCredential(credentialId);
      console.log("Passkey revoked. Browser sessions using it no longer authorize owner access.");
      break;
    default: throw new Error("Usage: node --env-file=.env.local scripts/owner-access.mjs invite|list|revoke-all|revoke-passkey <credential-id>");
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Owner access operation failed.");
  process.exitCode = 1;
}
