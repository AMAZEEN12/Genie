package ng.tesa.genie.request;

import java.time.Instant;
import java.util.UUID;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.auth.Role;

public record StatusHistoryEntry(
        UUID id,
        UUID requestId,
        String fromStatus,
        String toStatus,
        CurrentUser actor,
        String note,
        Instant at
) {
    /**
     * MVP feedback item 1: employees see nothing about billing. History notes written by other
     * people can carry amounts ("Estimate submitted: 6500000 kobo") or finance reasons, so an
     * employee only gets the notes they wrote themselves; the status steps stay visible.
     */
    public StatusHistoryEntry visibleTo(CurrentUser viewer) {
        boolean ownNote = actor != null && viewer != null && actor.id().equals(viewer.id());
        if (viewer == null || viewer.role() != Role.EMPLOYEE || ownNote || note == null) {
            return this;
        }
        return new StatusHistoryEntry(id, requestId, fromStatus, toStatus, actor, null, at);
    }
}
