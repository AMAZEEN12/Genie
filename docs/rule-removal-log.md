# Rule-removal log (Genie)

Proof that each business-rule test **fails when its protection is removed** (brief: Verification, 13 marks; test-plan "Final" target).
Rule of the log: never commit a disabled guard to `main`. Do each removal on a throwaway local branch (`git switch -c scratch/remove-<rule>`), paste the failing output, then `git switch main` and delete the branch.

How to run one test:
```bash
cd service
./mvnw -B clean verify -Dit.test=<TestClass> -Dtest=NoUnitTests -Dsurefire.failIfNoSpecifiedTests=false
```
A valid entry shows `BUILD FAILURE` and the **test class name** in the output. A compile or setup error is not evidence.

| # | Rule | Test | Protection to remove (exact place) | Status |
|---|------|------|------------------------------------|--------|
| 1 | R4 one assignment at a time | `AssignmentConcurrencyIT` | In `RequestRepository.assignTechnician`, the `AND status = 'REPORTED' AND version = :expectedVersion` conditions | Logged on branch `evidence/no-assignment-guard` (commit 606ad46). **TODO: paste the GitHub Actions run link and the saved `no-assignment-guard-FAILS.log` here** |
| 2 | R1 roles enforced in the service | `AuthorizationIT` | In `SecurityConfig`, change `.requestMatchers(HttpMethod.PUT, "/api/v1/requests/*/assignment").hasRole("MANAGER")` to `.permitAll()` (the side-project standard requires this one) | TODO |
| 3 | R3 create request once | `IdempotencyIT` | `idempotency_key UUID UNIQUE` in `V2__requests.sql` and the lookup by key in `RequestRepository` | TODO |
| 4 | R5 finance cannot approve own submission | `EstimateIT` | `chk_estimate_no_self_approval` in `V3__estimates_history.sql` (and the service check) | TODO |
| 5 | R6 no start without approved estimate | `StartWithoutApprovalIT` | `status = 'ESTIMATE_APPROVED'` condition in the start-work UPDATE (`RequestRepository`, around line 227) | TODO |
| 6 | R8 cannot close without completion details | `CloseRulesIT#cannotCloseWithoutCompletion` | `chk_request_close_completion` in `V2__requests.sql` | TODO |
| 7 | R9 technician cannot verify own job | `CloseRulesIT#technicianCannotVerifyOwnJob` | `chk_request_no_self_verify` and the `technician_id <> :managerId` condition | TODO |
| 8 | R7 override only for URGENT, reviewed before close | `OverrideIT` | `chk_request_override_urgent`, `chk_request_close_override_review` | TODO |
| 9 | R10 history is append-only | `HistoryAppendOnlyIT` | `trg_status_history_append_only` in `V4__append_only.sql` | TODO |
| 10 | Money has no floats | `NoFloatSchemaIT` | Jackson strict-number settings in `JacksonConfig` | TODO |

## Entry template (copy one per rule)
```
### <#> <rule>
- Date / by:
- Branch (scratch, deleted after):
- What was removed (file, line, one sentence):
- Command:
- Result: BUILD FAILURE, <N> failures in <TestClass>
- Output (paste the 10-20 relevant lines, include the assertion message):
- Restored and re-run: BUILD SUCCESS (date)
```

## Entries
(none yet)
