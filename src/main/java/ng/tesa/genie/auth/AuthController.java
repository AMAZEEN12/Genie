package ng.tesa.genie.auth;

import java.time.Instant;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class AuthController {

    private final UserRepository users;
    private final TokenService tokens;
    private final PasswordEncoder passwordEncoder;
    /**
     * Checked when the email is unknown, so a wrong email takes as long as a wrong password and
     * response times don't reveal which accounts exist.
     */
    private final String timingHash;

    public AuthController(UserRepository users, TokenService tokens, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.tokens = tokens;
        this.passwordEncoder = passwordEncoder;
        this.timingHash = passwordEncoder.encode("timing-equaliser-not-a-password");
    }

    public record LoginRequest(
        @NotBlank(message = "is required") @Email(message = "must be a valid email") String email,
        @NotBlank(message = "is required") @Size(min = 8, message = "must be at least 8 characters") String password
    ) {
    }

    public record SessionResponse(
        String token,
        Instant expiresAt,
        CurrentUser user
    ) {
    }

    /** Wrong email and wrong password get the same 401, in the same time, so accounts can't be discovered. */
    @PostMapping("/auth/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<SessionResponse> createSession(@Valid @RequestBody LoginRequest request) {
        var found = users.findByEmail(request.email());
        String hash = found.map(UserRepository.UserWithPassword::passwordHash).orElse(timingHash);
        boolean matches = passwordEncoder.matches(request.password(), hash);
        if (found.isEmpty() || !matches) {
            throw new BadCredentialsException("Invalid email or password.");
        }
        CurrentUser user = found.get().toCurrentUser();
        TokenService.IssuedToken token = tokens.issue(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new SessionResponse(token.value(), token.expiresAt(), user));
    }

    @GetMapping("/me")
    public CurrentUser me(@AuthenticationPrincipal CurrentUser user) {
        return user;
    }
}
