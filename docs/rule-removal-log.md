# Rule-removal log (Genie)

Proof that each business-rule test **fails when its protection is removed** (brief: Verification, 13 marks; test-plan "Final" target).
Every removal was done on a throwaway local branch (`scratch/rule-removal`) and never committed to `main`. The removals are scripted in `tools/rule-removal/rules.json` and run by `tools/rule-removal/run-rule-removal.ps1`.

**Run:** 2026-10-28, about 01:18 (Lagos time), by Blessing Nwafor. Run folder on her machine: `C:\Users\NWAFOR BLESSING\rule-removal-logs\20261028-011835`.

How one test is run (PowerShell, from `service/`; every `-D` option is quoted):
```powershell
.\mvnw.cmd -B clean verify "-Dit.test=<TestClass>" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"
```
A valid entry shows `BUILD FAILURE` and the **test class name** in the output. The script marks a run valid only if the log has no compile, Docker or setup error and shows at least one test failure or error.

## Summary
| # | Rule | Test | Result 2026-10-28 |
|---|------|------|-------------------|
| 1 | R4 one assignment at a time | `AssignmentConcurrencyIT` | Fails without the protection |
| 2 | R1 roles enforced in the service | `AuthorizationIT` | Fails without the protection |
| 3 | R3 create request once | `IdempotencyIT` | Fails without the protection |
| 4 | R5 finance cannot approve own submission | `EstimateIT` | Fails without the protection |
| 5 | R6 no start without approved estimate | `StartWithoutApprovalIT` | Fails without the protection |
| 6 | R8 cannot close without completion details | `CloseRulesIT` | Fails without the protection |
| 7 | R9 technician cannot verify own job | `CloseRulesIT` | Fails without the protection |
| 8 | R7 override only for URGENT, reviewed before close | `OverrideIT` | Fails without the protection |
| 9 | R10 history is append-only | `HistoryAppendOnlyIT` | Fails without the protection |
| 10 | Money has no floats | `NoFloatSchemaIT` | Fails without the protection |
| 11 | R15 employees see no billing (service) | `EmployeeBillingIT` | Fails without the protection (2026-10-29) |
| 12 | R20 estimate lines add up (service check) | `EstimateBreakdownIT` | Fails without the protection (2026-10-29) |
| 13 | R20 estimate lines add up (database trigger) | `EstimateBreakdownIT` | Fails without the protection (2026-10-29) |

All ten runs were reported by the script as "FAILS AS EXPECTED (valid evidence)".
Not yet recorded: a green re-run after restoring each rule. The runner restored the code with `git checkout -- service` after each rule, but it was run without `-ConfirmGreen`. The passing state is shown by CI on `main`.

## Entries
Fill each **Output** block by pasting the lines from the matching entry in `entries.md` in the run folder (up to 20 lines: the `Tests run:` line and the assertion message). Do not write output from memory.

### 1. R4 one assignment at a time
- Date / by: 2026-10-28 / Blessing Nwafor
- Branch (scratch, deleted after): `scratch/rule-removal`
- Files changed: service/.../request/RequestRepository.java (assignTechnician)
- What was removed: Removed `AND status = 'REPORTED' AND version = :expectedVersion` from the assignment UPDATE, leaving `WHERE id = :id`.
- Command: `.\mvnw.cmd -B clean verify "-Dit.test=AssignmentConcurrencyIT" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"`
- Result: BUILD FAILURE, `AssignmentConcurrencyIT` failed (script verdict: FAILS AS EXPECTED)
- Log file: `01-*-FAILS.log` in the run folder
- Output:
```
<paste the lines from entries.md for this rule>
```
- Failing test method(s): <fill in from the log>
- Restored: `git checkout -- service` (done by the runner). Green re-run: <date, or "see CI on main">

### 2. R1 roles enforced in the service
- Date / by: 2026-10-28 / Blessing Nwafor
- Branch (scratch, deleted after): `scratch/rule-removal`
- Files changed: service/.../config/SecurityConfig.java and request/RequestController.java
- What was removed: Changed the assignment route from `.hasRole("MANAGER")` to `.permitAll()` and disabled the second role check in `RequestController.assignTechnician` (`if (false)`). Both layers had to go, because the controller also refuses non-managers.
- Command: `.\mvnw.cmd -B clean verify "-Dit.test=AuthorizationIT" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"`
- Result: BUILD FAILURE, `AuthorizationIT` failed (script verdict: FAILS AS EXPECTED)
- Log file: `02-*-FAILS.log` in the run folder
- Output:
```
<paste the lines from entries.md for this rule>
```
- Failing test method(s): <fill in from the log>
- Restored: `git checkout -- service` (done by the runner). Green re-run: <date, or "see CI on main">

### 3. R3 create request once
- Date / by: 2026-10-28 / Blessing Nwafor
- Branch (scratch, deleted after): `scratch/rule-removal`
- Files changed: service/.../request/RequestWorkflowService.java and db/migration/V2__requests.sql
- What was removed: Made `createRequest` skip the lookup by idempotency key, and dropped `UNIQUE` from `idempotency_key` in V2 (scratch branch only).
- Command: `.\mvnw.cmd -B clean verify "-Dit.test=IdempotencyIT" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"`
- Result: BUILD FAILURE, `IdempotencyIT` failed (script verdict: FAILS AS EXPECTED)
- Log file: `03-*-FAILS.log` in the run folder
- Output:
```
<paste the lines from entries.md for this rule>
```
- Failing test method(s): <fill in from the log>
- Restored: `git checkout -- service` (done by the runner). Green re-run: <date, or "see CI on main">

### 4. R5 finance cannot approve own submission
- Date / by: 2026-10-28 / Blessing Nwafor
- Branch (scratch, deleted after): `scratch/rule-removal`
- Files changed: service/.../request/RequestWorkflowService.java and db/migration/V3__estimates_history.sql
- What was removed: Disabled the self-approval check (`if (false)`) and replaced the `chk_estimate_no_self_approval` condition with `TRUE`.
- Command: `.\mvnw.cmd -B clean verify "-Dit.test=EstimateIT" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"`
- Result: BUILD FAILURE, `EstimateIT` failed (script verdict: FAILS AS EXPECTED)
- Log file: `04-*-FAILS.log` in the run folder
- Output:
```
<paste the lines from entries.md for this rule>
```
- Failing test method(s): <fill in from the log>
- Restored: `git checkout -- service` (done by the runner). Green re-run: <date, or "see CI on main">

### 5. R6 no start without approved estimate
- Date / by: 2026-10-28 / Blessing Nwafor
- Branch (scratch, deleted after): `scratch/rule-removal`
- Files changed: service/.../request/RequestRepository.java (startWork)
- What was removed: Removed `AND status = 'ESTIMATE_APPROVED'` from the start-work UPDATE.
- Command: `.\mvnw.cmd -B clean verify "-Dit.test=StartWithoutApprovalIT" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"`
- Result: BUILD FAILURE, `StartWithoutApprovalIT` failed (script verdict: FAILS AS EXPECTED)
- Log file: `05-*-FAILS.log` in the run folder
- Output:
```
<paste the lines from entries.md for this rule>
```
- Failing test method(s): <fill in from the log>
- Restored: `git checkout -- service` (done by the runner). Green re-run: <date, or "see CI on main">

### 6. R8 cannot close without completion details
- Date / by: 2026-10-28 / Blessing Nwafor
- Branch (scratch, deleted after): `scratch/rule-removal`
- Files changed: service/.../db/migration/V2__requests.sql
- What was removed: Replaced the condition in `chk_request_close_completion` with `TRUE`.
- Command: `.\mvnw.cmd -B clean verify "-Dit.test=CloseRulesIT" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"`
- Result: BUILD FAILURE, `CloseRulesIT` failed (script verdict: FAILS AS EXPECTED)
- Log file: `06-*-FAILS.log` in the run folder
- Output:
```
<paste the lines from entries.md for this rule>
```
- Failing test method(s): <fill in from the log>
- Restored: `git checkout -- service` (done by the runner). Green re-run: <date, or "see CI on main">
- Note: The whole class `CloseRulesIT` was run. In the log, check that the failing method is `cannotCloseWithoutCompletion`, and write its name here.

### 7. R9 technician cannot verify own job
- Date / by: 2026-10-28 / Blessing Nwafor
- Branch (scratch, deleted after): `scratch/rule-removal`
- Files changed: service/.../request/RequestWorkflowService.java, RequestRepository.java and V2__requests.sql
- What was removed: Disabled the self-verify check (`if (false)`), removed `technician_id <> :managerId` from the verify UPDATE, and replaced `chk_request_no_self_verify` with `TRUE`.
- Command: `.\mvnw.cmd -B clean verify "-Dit.test=CloseRulesIT" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"`
- Result: BUILD FAILURE, `CloseRulesIT` failed (script verdict: FAILS AS EXPECTED)
- Log file: `07-*-FAILS.log` in the run folder
- Output:
```
<paste the lines from entries.md for this rule>
```
- Failing test method(s): <fill in from the log>
- Restored: `git checkout -- service` (done by the runner). Green re-run: <date, or "see CI on main">
- Note: The whole class `CloseRulesIT` was run. In the log, check that the failing method is `technicianCannotVerifyOwnJob`, and write its name here.

### 8. R7 override only for URGENT, reviewed before close
- Date / by: 2026-10-28 / Blessing Nwafor
- Branch (scratch, deleted after): `scratch/rule-removal`
- Files changed: service/.../request/RequestRepository.java and V2__requests.sql
- What was removed: Removed `AND priority = 'URGENT'` from the override UPDATE, and replaced `chk_request_override_urgent` and `chk_request_close_override_review` with `TRUE`.
- Command: `.\mvnw.cmd -B clean verify "-Dit.test=OverrideIT" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"`
- Result: BUILD FAILURE, `OverrideIT` failed (script verdict: FAILS AS EXPECTED)
- Log file: `08-*-FAILS.log` in the run folder
- Output:
```
<paste the lines from entries.md for this rule>
```
- Failing test method(s): <fill in from the log>
- Restored: `git checkout -- service` (done by the runner). Green re-run: <date, or "see CI on main">

### 9. R10 history is append-only
- Date / by: 2026-10-28 / Blessing Nwafor
- Branch (scratch, deleted after): `scratch/rule-removal`
- Files changed: service/.../db/migration/V4__append_only.sql
- What was removed: Replaced the `RAISE EXCEPTION` in the trigger function with `RETURN COALESCE(NEW, OLD);`, so updates and deletes are allowed.
- Command: `.\mvnw.cmd -B clean verify "-Dit.test=HistoryAppendOnlyIT" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"`
- Result: BUILD FAILURE, `HistoryAppendOnlyIT` failed (script verdict: FAILS AS EXPECTED)
- Log file: `09-*-FAILS.log` in the run folder
- Output:
```
<paste the lines from entries.md for this rule>
```
- Failing test method(s): <fill in from the log>
- Restored: `git checkout -- service` (done by the runner). Green re-run: <date, or "see CI on main">

### 10. Money has no floats
- Date / by: 2026-10-28 / Blessing Nwafor
- Branch (scratch, deleted after): `scratch/rule-removal`
- Files changed: service/.../config/JacksonConfig.java
- What was removed: Enabled `ACCEPT_FLOAT_AS_INT` and changed the Integer coercion for Float input from `Fail` to `TryConvert`.
- Command: `.\mvnw.cmd -B clean verify "-Dit.test=NoFloatSchemaIT" "-Dtest=NoUnitTests" "-Dsurefire.failIfNoSpecifiedTests=false"`
- Result: BUILD FAILURE, `NoFloatSchemaIT` failed (script verdict: FAILS AS EXPECTED)
- Log file: `10-*-FAILS.log` in the run folder
- Output:
```
<paste the lines from entries.md for this rule>
```
- Failing test method(s): <fill in from the log>
- Restored: `git checkout -- service` (done by the runner). Green re-run: <date, or "see CI on main">

## Limits of this evidence
- Several rules are protected twice (service code and database). Each entry lists everything that had to be removed for the test to fail. A test that fails only when both layers are removed shows that the layers overlap, which is intended.
- Rule 1 was already shown on the branch `evidence/no-assignment-guard` (commit 606ad46). The GitHub Actions "Concurrency evidence" run link is still to be added: <link>.
- Rule 10 changes two Jackson settings. If a reviewer asks which one the test depends on, remove them one at a time and record the result.

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

