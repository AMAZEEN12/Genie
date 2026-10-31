# Rule-removal log (Genie)

Proof that each business-rule test **fails when its protection is removed** (brief: Verification, 13 marks; test-plan "Final" target).
Every removal was done on a throwaway checkout and never committed to `main`. The removals are scripted in `tools/rules-removal/rules.json`. They run on GitHub Actions through `.github/workflows/rule-removal.yml` and `tools/rules-removal/run-on-ci.mjs` (the local PowerShell runner, `run-rule-removal.ps1`, does the same on a machine with Docker).

**Run (evidence below):** 2026-10-31, GitHub Actions run [41175833281](https://github.com/AMAZEEN12/Genie/actions/runs/41175833281), commit `acb702f`, started by Blessing Nwafor. The logs and `entries.md` are in the run's `rule-removal-evidence` artifact.

**Earlier run discarded:** a first run on 2026-10-28 (about 01:18, on Blessing's machine) is not used as evidence. Docker Desktop was not running, so every test class crashed at start-up (`ExceptionInInitializerError`, `Could not find a valid Docker environment`) and no test body ran. The PowerShell runner did not recognise that message and reported "FAILS AS EXPECTED"; it now treats it as INVALID. The first CI run (2026-10-31) found that rule 8 still passed, because two service-layer checks were left in place; they are now part of the removal.

How one test is run (from `service/`):
```bash
./mvnw -B clean verify -Dit.test=<TestClass> -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false
```
A valid entry shows `BUILD FAILURE` and the **test class name** in the output. The runner marks a run valid only if the log has no compile, Docker or start-up error and shows at least one failing test, then re-runs the test after restoring the code and records the result.

## Summary
| # | Rule | Test | Result 2026-10-31 |
|---|------|------|-------------------|
| 1 | R4 one assignment at a time | `AssignmentConcurrencyIT` | Fails without the protection; passes again after restoring |
| 2 | R1 roles enforced in the service | `AuthorizationIT` | Fails without the protection; passes again after restoring |
| 3 | R3 create request once | `IdempotencyIT` | Fails without the protection; passes again after restoring |
| 4 | R5 finance cannot approve own submission | `EstimateIT` | Fails without the protection; passes again after restoring |
| 5 | R6 no start without approved estimate | `StartWithoutApprovalIT` | Fails without the protection; passes again after restoring |
| 6 | R8 cannot close without completion details | `CloseRulesIT` | Fails without the protection; passes again after restoring |
| 7 | R9 technician cannot verify own job | `CloseRulesIT` | Fails without the protection; passes again after restoring |
| 8 | R7 override only for URGENT, reviewed before close | `OverrideIT` | Fails without the protection; passes again after restoring |
| 9 | R10 history is append-only | `HistoryAppendOnlyIT` | Fails without the protection; passes again after restoring |
| 10 | Money has no floats | `NoFloatSchemaIT` | Fails without the protection; passes again after restoring |
| 11 | R15 employees see no billing (service) | `EmployeeBillingIT` | Fails without the protection (2026-10-29) |
| 12 | R20 estimate lines add up (service check) | `EstimateBreakdownIT` | Fails without the protection (2026-10-29) |
| 13 | R20 estimate lines add up (database trigger) | `EstimateBreakdownIT` | Fails without the protection (2026-10-29) |

Rows 1-10 come from CI run [41175833281](https://github.com/AMAZEEN12/Genie/actions/runs/41175833281): every test failed with the protection removed (`FAILS AS EXPECTED`) and passed again after `git checkout -- service` (`BUILD SUCCESS`, recorded in the `*-PASSES.log` files). Rows 11-13 were done by hand on 2026-10-29.

## Entries
Each **Output** block is pasted from the matching entry in `entries.md` in the run's artifact (up to 20 lines: the `Tests run:` line and the assertion message), not written from memory.

### 1. R4 one assignment at a time
- Date / by: 2026-10-31 / Blessing Nwafor (GitHub Actions run 41175833281)
- Where: throwaway checkout in the CI job (commit `acb702f`); nothing committed
- Files changed: service/.../request/RequestRepository.java (assignTechnician)
- What was removed: Removed `AND status = 'REPORTED' AND version = :expectedVersion` from the assignment UPDATE, leaving `WHERE id = :id`.
- Command: `cd service && ./mvnw -B clean verify -Dit.test=AssignmentConcurrencyIT -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false`
- Result: BUILD FAILURE, `AssignmentConcurrencyIT` failed (runner verdict: FAILS AS EXPECTED, valid evidence)
- Log file: `01-*-FAILS.log` in the run's `rule-removal-evidence` artifact
- Output:
```
[ERROR] Tests run: 10, Failures: 10, Errors: 0, Skipped: 0, Time elapsed: 13.05 s <<< FAILURE! -- in ng.tesa.genie.request.AssignmentConcurrencyIT
[ERROR] ng.tesa.genie.request.AssignmentConcurrencyIT.twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal()[1] -- Time elapsed: 0.687 s <<< FAILURE!
Expected size: 1 but was: 2 in:
[ERROR] ng.tesa.genie.request.AssignmentConcurrencyIT.twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal()[2] -- Time elapsed: 0.058 s <<< FAILURE!
Expected size: 1 but was: 2 in:
[ERROR] ng.tesa.genie.request.AssignmentConcurrencyIT.twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal()[3] -- Time elapsed: 0.058 s <<< FAILURE!
Expected size: 1 but was: 2 in:
[ERROR] ng.tesa.genie.request.AssignmentConcurrencyIT.twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal()[4] -- Time elapsed: 0.058 s <<< FAILURE!
Expected size: 1 but was: 2 in:
[ERROR] ng.tesa.genie.request.AssignmentConcurrencyIT.twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal()[5] -- Time elapsed: 0.048 s <<< FAILURE!
Expected size: 1 but was: 2 in:
[ERROR] ng.tesa.genie.request.AssignmentConcurrencyIT.twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal()[6] -- Time elapsed: 0.035 s <<< FAILURE!
Expected size: 1 but was: 2 in:
[ERROR] ng.tesa.genie.request.AssignmentConcurrencyIT.twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal()[7] -- Time elapsed: 0.035 s <<< FAILURE!
Expected size: 1 but was: 2 in:
[ERROR] ng.tesa.genie.request.AssignmentConcurrencyIT.twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal()[8] -- Time elapsed: 0.047 s <<< FAILURE!
Expected size: 1 but was: 2 in:
[ERROR] ng.tesa.genie.request.AssignmentConcurrencyIT.twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal()[9] -- Time elapsed: 0.040 s <<< FAILURE!
Expected size: 1 but was: 2 in:
[ERROR] ng.tesa.genie.request.AssignmentConcurrencyIT.twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal()[10] -- Time elapsed: 0.042 s <<< FAILURE!
```
- Failing test method(s): `twoManagersAssigningAtOnceProduceOneWinnerAndOneRefusal`
- Restored: `git checkout -- service` (done by the runner). Green re-run: BUILD SUCCESS, 2026-10-31 (`01-*-PASSES.log`)

### 2. R1 roles enforced in the service
- Date / by: 2026-10-31 / Blessing Nwafor (GitHub Actions run 41175833281)
- Where: throwaway checkout in the CI job (commit `acb702f`); nothing committed
- Files changed: service/.../config/SecurityConfig.java and request/RequestController.java
- What was removed: Changed the assignment route from `.hasRole("MANAGER")` to `.permitAll()` and disabled the second role check in `RequestController.assignTechnician` (`if (false)`). Both layers had to go, because the controller also refuses non-managers.
- Command: `cd service && ./mvnw -B clean verify -Dit.test=AuthorizationIT -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false`
- Result: BUILD FAILURE, `AuthorizationIT` failed (runner verdict: FAILS AS EXPECTED, valid evidence)
- Log file: `02-*-FAILS.log` in the run's `rule-removal-evidence` artifact
- Output:
```
[ERROR] Tests run: 5, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 7.897 s <<< FAILURE! -- in ng.tesa.genie.auth.AuthorizationIT
[ERROR] ng.tesa.genie.auth.AuthorizationIT.employeeCannotAssignTechnician -- Time elapsed: 0.253 s <<< FAILURE!
org.opentest4j.AssertionFailedError: 
expected: 403
 but was: 200
expected: 403
 but was: 200
[ERROR] Tests run: 5, Failures: 1, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
```
- Failing test method(s): `employeeCannotAssignTechnician`
- Restored: `git checkout -- service` (done by the runner). Green re-run: BUILD SUCCESS, 2026-10-31 (`02-*-PASSES.log`)

### 3. R3 create request once
- Date / by: 2026-10-31 / Blessing Nwafor (GitHub Actions run 41175833281)
- Where: throwaway checkout in the CI job (commit `acb702f`); nothing committed
- Files changed: service/.../request/RequestWorkflowService.java and db/migration/V2__requests.sql
- What was removed: Made `createRequest` skip the lookup by idempotency key, and dropped `UNIQUE` from `idempotency_key` in V2 (scratch branch only).
- Command: `cd service && ./mvnw -B clean verify -Dit.test=IdempotencyIT -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false`
- Result: BUILD FAILURE, `IdempotencyIT` failed (runner verdict: FAILS AS EXPECTED, valid evidence)
- Log file: `03-*-FAILS.log` in the run's `rule-removal-evidence` artifact
- Output:
```
[ERROR] Tests run: 2, Failures: 2, Errors: 0, Skipped: 0, Time elapsed: 6.299 s <<< FAILURE! -- in ng.tesa.genie.request.IdempotencyIT
[ERROR] ng.tesa.genie.request.IdempotencyIT.duplicateKeyWithSameBodyReturnsOriginalRequest -- Time elapsed: 1.213 s <<< FAILURE!
org.opentest4j.AssertionFailedError: 
expected: "47a1ffec-d565-4618-a4e2-8552b0bb157d"
 but was: "34a57308-2d7a-4d8f-a87b-1cfd7a2f5b50"
[ERROR] ng.tesa.genie.request.IdempotencyIT.duplicateKeyWithDifferentBodyReturns422 -- Time elapsed: 0.188 s <<< FAILURE!
org.opentest4j.AssertionFailedError: 
expected: 422
 but was: 201
expected: 422
 but was: 201
expected: "47a1ffec-d565-4618-a4e2-8552b0bb157d"
 but was: "34a57308-2d7a-4d8f-a87b-1cfd7a2f5b50"
[ERROR] Tests run: 2, Failures: 2, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
```
- Failing test method(s): `duplicateKeyWithSameBodyReturnsOriginalRequest`, `duplicateKeyWithDifferentBodyReturns422`
- Restored: `git checkout -- service` (done by the runner). Green re-run: BUILD SUCCESS, 2026-10-31 (`03-*-PASSES.log`)

### 4. R5 finance cannot approve own submission
- Date / by: 2026-10-31 / Blessing Nwafor (GitHub Actions run 41175833281)
- Where: throwaway checkout in the CI job (commit `acb702f`); nothing committed
- Files changed: service/.../request/RequestWorkflowService.java and db/migration/V3__estimates_history.sql
- What was removed: Disabled the self-approval check (`if (false)`) and replaced the `chk_estimate_no_self_approval` condition with `TRUE`.
- Command: `cd service && ./mvnw -B clean verify -Dit.test=EstimateIT -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false`
- Result: BUILD FAILURE, `EstimateIT` failed (runner verdict: FAILS AS EXPECTED, valid evidence)
- Log file: `04-*-FAILS.log` in the run's `rule-removal-evidence` artifact
- Output:
```
[ERROR] Tests run: 3, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 6.908 s <<< FAILURE! -- in ng.tesa.genie.estimate.EstimateIT
[ERROR] ng.tesa.genie.estimate.EstimateIT.selfApprovalIsRefusedByDirectCallAndDatabaseCheck -- Time elapsed: 0.169 s <<< FAILURE!
Expecting code to raise a throwable.
Expecting code to raise a throwable.
[ERROR] Tests run: 3, Failures: 1, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
```
- Failing test method(s): `selfApprovalIsRefusedByDirectCallAndDatabaseCheck`
- Restored: `git checkout -- service` (done by the runner). Green re-run: BUILD SUCCESS, 2026-10-31 (`04-*-PASSES.log`)

### 5. R6 no start without approved estimate
- Date / by: 2026-10-31 / Blessing Nwafor (GitHub Actions run 41175833281)
- Where: throwaway checkout in the CI job (commit `acb702f`); nothing committed
- Files changed: service/.../request/RequestRepository.java (startWork)
- What was removed: Removed `AND status = 'ESTIMATE_APPROVED'` from the start-work UPDATE.
- Command: `cd service && ./mvnw -B clean verify -Dit.test=StartWithoutApprovalIT -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false`
- Result: BUILD FAILURE, `StartWithoutApprovalIT` failed (runner verdict: FAILS AS EXPECTED, valid evidence)
- Log file: `05-*-FAILS.log` in the run's `rule-removal-evidence` artifact
- Output:
```
[ERROR] Tests run: 1, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 6.102 s <<< FAILURE! -- in ng.tesa.genie.request.StartWithoutApprovalIT
[ERROR] ng.tesa.genie.request.StartWithoutApprovalIT.directCallToStartWithoutApprovedEstimateReturns409 -- Time elapsed: 1.299 s <<< FAILURE!
org.opentest4j.AssertionFailedError: 
expected: 409
 but was: 200
expected: 409
 but was: 200
[ERROR] Tests run: 1, Failures: 1, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
```
- Failing test method(s): `directCallToStartWithoutApprovedEstimateReturns409`
- Restored: `git checkout -- service` (done by the runner). Green re-run: BUILD SUCCESS, 2026-10-31 (`05-*-PASSES.log`)

### 6. R8 cannot close without completion details
- Date / by: 2026-10-31 / Blessing Nwafor (GitHub Actions run 41175833281)
- Where: throwaway checkout in the CI job (commit `acb702f`); nothing committed
- Files changed: service/.../db/migration/V2__requests.sql
- What was removed: Replaced the condition in `chk_request_close_completion` with `TRUE`.
- Command: `cd service && ./mvnw -B clean verify -Dit.test=CloseRulesIT -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false`
- Result: BUILD FAILURE, `CloseRulesIT` failed (runner verdict: FAILS AS EXPECTED, valid evidence)
- Log file: `06-*-FAILS.log` in the run's `rule-removal-evidence` artifact
- Output:
```
[ERROR] Tests run: 2, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 5.760 s <<< FAILURE! -- in ng.tesa.genie.request.CloseRulesIT
[ERROR] ng.tesa.genie.request.CloseRulesIT.cannotCloseWithoutCompletion -- Time elapsed: 0.094 s <<< FAILURE!
Expecting code to raise a throwable.
Expecting code to raise a throwable.
[ERROR] Tests run: 2, Failures: 1, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
```
- Failing test method(s): `cannotCloseWithoutCompletion`
- Restored: `git checkout -- service` (done by the runner). Green re-run: BUILD SUCCESS, 2026-10-31 (`06-*-PASSES.log`)
- Note: the whole class `CloseRulesIT` was run; only the method named above failed, the other passed.

### 7. R9 technician cannot verify own job
- Date / by: 2026-10-31 / Blessing Nwafor (GitHub Actions run 41175833281)
- Where: throwaway checkout in the CI job (commit `acb702f`); nothing committed
- Files changed: service/.../request/RequestWorkflowService.java, RequestRepository.java and V2__requests.sql
- What was removed: Disabled the self-verify check (`if (false)`), removed `technician_id <> :managerId` from the verify UPDATE, and replaced `chk_request_no_self_verify` with `TRUE`.
- Command: `cd service && ./mvnw -B clean verify -Dit.test=CloseRulesIT -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false`
- Result: BUILD FAILURE, `CloseRulesIT` failed (runner verdict: FAILS AS EXPECTED, valid evidence)
- Log file: `07-*-FAILS.log` in the run's `rule-removal-evidence` artifact
- Output:
```
[ERROR] Tests run: 2, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 5.825 s <<< FAILURE! -- in ng.tesa.genie.request.CloseRulesIT
[ERROR] ng.tesa.genie.request.CloseRulesIT.technicianCannotVerifyOwnJob -- Time elapsed: 0.715 s <<< FAILURE!
Expecting code to raise a throwable.
Expecting code to raise a throwable.
[ERROR] Tests run: 2, Failures: 1, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
```
- Failing test method(s): `technicianCannotVerifyOwnJob`
- Restored: `git checkout -- service` (done by the runner). Green re-run: BUILD SUCCESS, 2026-10-31 (`07-*-PASSES.log`)
- Note: the whole class `CloseRulesIT` was run; only the method named above failed, the other passed.

### 8. R7 override only for URGENT, reviewed before close
- Date / by: 2026-10-31 / Blessing Nwafor (GitHub Actions run 41175833281)
- Where: throwaway checkout in the CI job (commit `acb702f`); nothing committed
- Files changed: service/.../request/RequestRepository.java, RequestWorkflowService.java and V2__requests.sql
- What was removed: Removed `AND priority = 'URGENT'` from the override UPDATE, replaced `chk_request_override_urgent` and `chk_request_close_override_review` with `TRUE`, and disabled the two service checks in `RequestWorkflowService` (`if (!"URGENT".equals(req.priority()))` and `if (req.override() && req.overrideReview() == null)`, both changed to `if (false)`).
- Command: `cd service && ./mvnw -B clean verify -Dit.test=OverrideIT -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false`
- Result: BUILD FAILURE, `OverrideIT` failed (runner verdict: FAILS AS EXPECTED, valid evidence)
- Log file: `08-*-FAILS.log` in the run's `rule-removal-evidence` artifact
- Output:
```
[ERROR] Tests run: 3, Failures: 2, Errors: 0, Skipped: 0, Time elapsed: 6.863 s <<< FAILURE! -- in ng.tesa.genie.request.OverrideIT
[ERROR] ng.tesa.genie.request.OverrideIT.closingWithUnreviewedOverrideReturns409AndSucceedsAfterFinanceReview -- Time elapsed: 1.442 s <<< FAILURE!
org.opentest4j.AssertionFailedError: 
expected: 409
 but was: 200
[ERROR] ng.tesa.genie.request.OverrideIT.nonUrgentOverrideIsRefused -- Time elapsed: 0.269 s <<< FAILURE!
org.opentest4j.AssertionFailedError: 
expected: 409
 but was: 200
expected: 409
 but was: 200
expected: 409
 but was: 200
[ERROR] Tests run: 3, Failures: 2, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
```
- Failing test method(s): `closingWithUnreviewedOverrideReturns409AndSucceedsAfterFinanceReview`, `nonUrgentOverrideIsRefused`
- Restored: `git checkout -- service` (done by the runner). Green re-run: BUILD SUCCESS, 2026-10-31 (`08-*-PASSES.log`)

### 9. R10 history is append-only
- Date / by: 2026-10-31 / Blessing Nwafor (GitHub Actions run 41175833281)
- Where: throwaway checkout in the CI job (commit `acb702f`); nothing committed
- Files changed: service/.../db/migration/V4__append_only.sql
- What was removed: Replaced the `RAISE EXCEPTION` in the trigger function with `RETURN COALESCE(NEW, OLD);`, so updates and deletes are allowed.
- Command: `cd service && ./mvnw -B clean verify -Dit.test=HistoryAppendOnlyIT -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false`
- Result: BUILD FAILURE, `HistoryAppendOnlyIT` failed (runner verdict: FAILS AS EXPECTED, valid evidence)
- Log file: `09-*-FAILS.log` in the run's `rule-removal-evidence` artifact
- Output:
```
[ERROR] Tests run: 1, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 5.935 s <<< FAILURE! -- in ng.tesa.genie.request.HistoryAppendOnlyIT
[ERROR] ng.tesa.genie.request.HistoryAppendOnlyIT.statusHistoryUpdateAndDeleteAreForbiddenByTrigger -- Time elapsed: 1.056 s <<< FAILURE!
Expecting code to raise a throwable.
Expecting code to raise a throwable.
[ERROR] Tests run: 1, Failures: 1, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
```
- Failing test method(s): `statusHistoryUpdateAndDeleteAreForbiddenByTrigger`
- Restored: `git checkout -- service` (done by the runner). Green re-run: BUILD SUCCESS, 2026-10-31 (`09-*-PASSES.log`)

### 10. Money has no floats
- Date / by: 2026-10-31 / Blessing Nwafor (GitHub Actions run 41175833281)
- Where: throwaway checkout in the CI job (commit `acb702f`); nothing committed
- Files changed: service/.../config/JacksonConfig.java
- What was removed: Enabled `ACCEPT_FLOAT_AS_INT` and changed the Integer coercion for Float input from `Fail` to `TryConvert`.
- Command: `cd service && ./mvnw -B clean verify -Dit.test=NoFloatSchemaIT -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false`
- Result: BUILD FAILURE, `NoFloatSchemaIT` failed (runner verdict: FAILS AS EXPECTED, valid evidence)
- Log file: `10-*-FAILS.log` in the run's `rule-removal-evidence` artifact
- Output:
```
[ERROR] Tests run: 1, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 6.294 s <<< FAILURE! -- in ng.tesa.genie.config.NoFloatSchemaIT
[ERROR] ng.tesa.genie.config.NoFloatSchemaIT.fractionalKoboAndMalformedMoneyAreRefused -- Time elapsed: 1.316 s <<< FAILURE!
org.opentest4j.AssertionFailedError: 
expected: 400
 but was: 201
expected: 400
 but was: 201
[ERROR] Tests run: 1, Failures: 1, Errors: 0, Skipped: 0
[INFO] BUILD FAILURE
```
- Failing test method(s): `fractionalKoboAndMalformedMoneyAreRefused`
- Restored: `git checkout -- service` (done by the runner). Green re-run: BUILD SUCCESS, 2026-10-31 (`10-*-PASSES.log`)

### 11. R15 employees see no billing (service)
**Run:** 2026-10-29 by the agent for Nnaemeka Chukwuma, on Nnaemeka's machine, with the change restored afterwards (never committed).
**Removed:** in `RequestDetailResponse.forViewer`, the EMPLOYEE branch (condition replaced by `if (true)`, so everyone gets the full response).
**Test:** `EmployeeBillingIT#employeeGetsNoCostDataInTheRequestDetail`. **Result:** failed, `[estimates for an employee] expected: 0 but was: 1`.

### 12. R20 estimate lines add up (service check)
**Removed:** the `sum != amountKobo` check in `RequestWorkflowService.submitEstimate`.
**Test:** `EstimateBreakdownIT#totalThatDoesNotMatchTheLinesIsRefusedAndNothingIsRecorded`. **Result:** failed, `expected: 400 but was: 500`. The database trigger still refused the estimate, so nothing was recorded: the rule is protected twice.

### 13. R20 estimate lines add up (database trigger)
**Removed:** in V5's `fn_estimate_lines_match_total`, the mismatch condition (replaced by `IF false`).
**Test:** `EstimateBreakdownIT#databaseRefusesLinesThatDoNotAddUp`. **Result:** failed, `Expecting code to raise a throwable` (the mismatched line was accepted by direct SQL).

## Limits of this evidence
- Several rules are protected twice (service code and database). Each entry lists everything that had to be removed for the test to fail. A test that fails only when both layers are removed shows that the layers overlap, which is intended.
- Rule 1 was already shown on the branch `evidence/no-assignment-guard` (commit 606ad46). The GitHub Actions "Concurrency evidence" run link is still to be added: <link>. Rule 1 is also shown in the run above (`AssignmentConcurrencyIT` fails 10 of 10 repeated runs with `Expected size: 1 but was: 2`).
- Rule 10 changes two Jackson settings. If a reviewer asks which one the test depends on, remove them one at a time and record the result.

- Rule 8 (R7) is protected in four places: the two service checks in `RequestWorkflowService` (URGENT priority and finance review before close), the guarded UPDATE in `RequestRepository`, and the two database constraints. The test passed until all of them were removed, so the layers overlap by design.
