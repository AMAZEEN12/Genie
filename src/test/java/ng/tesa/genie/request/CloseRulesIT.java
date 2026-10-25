package ng.tesa.genie.request;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import ng.tesa.genie.support.ApiTestSupport;

class CloseRulesIT extends ApiTestSupport {

    @Test
    void cannotCloseWithoutCompletion() {
        // Direct SQL test against CHECK chk_request_close_completion
        assertThatThrownBy(() -> {
            jdbc.sql("""
                    INSERT INTO maintenance_request (
                        reference, request_hash, title, description, building, location,
                        equipment, category, priority, status, reported_by
                    ) VALUES (
                        'TEST-INCOMPLETE-CLOSE', 'hash', 'Incomplete', 'Desc', 'Bldg', 'Loc',
                        'Equip', 'Cat', 'LOW', 'VERIFIED_CLOSED', :userId
                    )
                    """)
                    .param("userId", employeeId)
                    .update();
        }).isInstanceOf(DataIntegrityViolationException.class)
          .hasMessageContaining("chk_request_close_completion");
    }

    @Test
    void technicianCannotVerifyOwnJob() {
        // Direct SQL test against CHECK chk_request_no_self_verify
        assertThatThrownBy(() -> {
            jdbc.sql("""
                    INSERT INTO maintenance_request (
                        reference, request_hash, title, description, building, location,
                        equipment, category, priority, status, reported_by, technician_id,
                        verified_by, work_done, actual_cost_kobo, completed_on
                    ) VALUES (
                        'TEST-SELF-VERIFY', 'hash', 'Self Verify', 'Desc', 'Bldg', 'Loc',
                        'Equip', 'Cat', 'LOW', 'VERIFIED_CLOSED', :empId, :techId,
                        :techId, 'Work done', 1000, '2026-10-25'
                    )
                    """)
                    .param("empId", employeeId)
                    .param("techId", technicianId)
                    .update();
        }).isInstanceOf(DataIntegrityViolationException.class)
          .hasMessageContaining("chk_request_no_self_verify");
    }
}
