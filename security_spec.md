# Security Specification for Polis

## Data Invariants
1. **Citizenship Hierarchy**: Users start as `applicant`. Promotion to `participant` (Citizen) requires an approved `petition`.
2. **Task Integrity**: Only `Mediators` can create `global_tasks`. Citizens can only `claim` tasks that are `open`.
3. **Reputation Math**: Reputation is a derived value, but in Firestore it should be validated against range limits (0-100).
4. **Message Authenticity**: Users can only send messages as themselves. Synthetic agents (AI) are managed by admins.
5. **System Stability**: Only `admins` can modify `system_config`.

## The "Dirty Dozen" Payloads

1. **Identity Spoofing**: User A tries to create a `UserProfile` for User B.
2. **Privilege Escalation**: User tries to set their own role to `admin` during creation.
3. **Role Hijacking**: User tries to update their role to `mediator` without admin approval.
4. **Task Theft**: User tries to claim a task that is already `claimed` or `completed`.
5. **Vote Fraud**: User tries to increment `proposals` votes by 10 instead of 1.
6. **Notification Spam**: User tries to create a notification for another user.
7. **Petition Bypassing**: User tries to set their `petition` status to `approved` themselves.
8. **Resource Exhaustion**: User tries to send a message with 1MB of text.
9. **ID Poisoning**: User tries to create a document with a 10KB junk string as the ID.
10. **Time Travel**: User tries to set `createdAt` to a date in the past.
11. **Shadow Update**: User tries to add a hidden `isVerified: true` field to their profile.
12. **Synthetic Impersonation**: Non-admin user tries to create a user with `isAI: true`.

## Test Runner (Conceptual Plan)
Verification will be performed against `firestore.rules`.
