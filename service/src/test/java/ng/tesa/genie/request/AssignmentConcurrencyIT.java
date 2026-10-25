package ng.tesa.genie.request;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.auth.Role;
import ng.tesa.genie.common.ConflictException;
import ng.tesa.genie.common.ErrorCode;
import ng.tesa.genie.support.DatabaseTestSupport;
import ng.tesa.genie.support.Parallel;

/**
 * R4: Two managers assigning at once produce exactly one assignment and one 409 ALREADY_ASSIGNED.
 * Implemented as a guarded update: WHERE id=:id AND status='REPORTED' AND version=:v.
 * This test fails on the evidence/no-assignment-guard branch.
 */
class AssignmentConcurrencyIT extends DatabaseTestSupport {

    @Autowired
    private RequestWorkflowService workflow;

    @Autowired
    private RequestRepository requests;

    @Autowired
    private HistoryRepository history;

    @RepeatedTest(10)
    void twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal() throws Exception {
        CurrentUser employee = new CurrentUser(UUID.randomUUID(), "emp@genie.test", "Emp", Role.EMPLOYEE);
        jdbc.sql("INSERT INTO app_user (id, email, password_hash, display_name, role) VALUES (:id, :e, 'hash', :n, :r)")
                .param("id", employee.id()).param("e", employee.email()).param("n", employee.displayName()).param("r", employee.role().name())
                .update();

        CurrentUser manager1 = new CurrentUser(UUID.randomUUID(), "mgr1@genie.test", "Mgr 1", Role.MANAGER);
        jdbc.sql("INSERT INTO app_user (id, email, password_hash, display_name, role) VALUES (:id, :e, 'hash', :n, :r)")
                .param("id", manager1.id()).param("e", manager1.email()).param("n", manager1.displayName()).param("r", manager1.role().name())
                .update();

        CurrentUser manager2 = new CurrentUser(UUID.randomUUID(), "mgr2@genie.test", "Mgr 2", Role.MANAGER);
        jdbc.sql("INSERT INTO app_user (id, email, password_hash, display_name, role) VALUES (:id, :e, 'hash', :n, :r)")
                .param("id", manager2.id()).param("e", manager2.email()).param("n", manager2.displayName()).param("r", manager2.role().name())
                .update();

        CurrentUser tech1 = new CurrentUser(UUID.randomUUID(), "tech1@genie.test", "Tech 1", Role.TECHNICIAN);
        jdbc.sql("INSERT INTO app_user (id, email, password_hash, display_name, role) VALUES (:id, :e, 'hash', :n, :r)")
                .param("id", tech1.id()).param("e", tech1.email()).param("n", tech1.displayName()).param("r", tech1.role().name())
                .update();

        CurrentUser tech2 = new CurrentUser(UUID.randomUUID(), "tech2@genie.test", "Tech 2", Role.TECHNICIAN);
        jdbc.sql("INSERT INTO app_user (id, email, password_hash, display_name, role) VALUES (:id, :e, 'hash', :n, :r)")
                .param("id", tech2.id()).param("e", tech2.email()).param("n", tech2.displayName()).param("r", tech2.role().name())
                .update();

        MaintenanceRequest req = workflow.createRequest("AC Leak", "AC is leaking water", "Main Tower",
                "Room 101", "AC-1", "HVAC", "HIGH", UUID.randomUUID(), employee);

        List<Object> outcomes = Parallel.run(2, n -> {
            if (n == 0) {
                return workflow.assignTechnician(req.id(), tech1.id(), Instant.now().plusSeconds(86400), req.version(), manager1);
            } else {
                return workflow.assignTechnician(req.id(), tech2.id(), Instant.now().plusSeconds(172800), req.version(), manager2);
            }
        });

        assertThat(outcomes).filteredOn(MaintenanceRequest.class::isInstance).hasSize(1);
        assertThat(outcomes).filteredOn(ConflictException.class::isInstance).hasSize(1);

        ConflictException refusal = (ConflictException) outcomes.stream()
                .filter(ConflictException.class::isInstance)
                .findFirst().orElseThrow();
        assertThat(refusal.code()).isEqualTo(ErrorCode.ALREADY_ASSIGNED);

        MaintenanceRequest finalReq = requests.findById(req.id()).orElseThrow();
        assertThat(finalReq.status()).isEqualTo("ASSIGNED");
        assertThat(finalReq.version()).isEqualTo(req.version() + 1);
        assertThat(finalReq.technician()).isNotNull();

        List<StatusHistoryEntry> hist = history.findByRequestId(req.id());
        // Initial REPORTED + exactly 1 ASSIGNED
        assertThat(hist).hasSize(2);
        assertThat(hist.get(1).toStatus()).isEqualTo("ASSIGNED");
    }
}
