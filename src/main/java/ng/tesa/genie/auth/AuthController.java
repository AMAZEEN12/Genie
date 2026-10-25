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

    public AuthController(UserRepository users, TokenService tokens, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.tokens = tokens;
        this.passwordEncoder = passwordEncoder;
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

    @PostMapping("/auth/sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<SessionResponse> createSession(@Valid @RequestBody LoginRequest request) {
        var userWithPw = users.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password."));
        if (!passwordEncoder.matches(request.password(), userWithPw.passwordHash())) {
            throw new BadCredentialsException("Invalid email or password.");
        }
        CurrentUser user = userWithPw.toCurrentUser();
        TokenService.IssuedToken token = tokens.issue(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(new SessionResponse(token.value(), token.expiresAt(), user));
    }

    @GetMapping("/me")
    public CurrentUser me(@AuthenticationPrincipal CurrentUser user) {
        return user;
    }
}
