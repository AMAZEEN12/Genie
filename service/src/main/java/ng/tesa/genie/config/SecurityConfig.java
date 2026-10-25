package ng.tesa.genie.config;

import java.time.Clock;
import java.util.List;
import java.util.UUID;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.security.web.SecurityFilterChain;

import ng.tesa.genie.auth.CurrentUser;
import ng.tesa.genie.auth.TokenService;
import ng.tesa.genie.auth.UserRepository;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http, ProblemSecurityHandlers problems,
                            Converter<Jwt, AbstractAuthenticationToken> currentUserConverter) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> { })
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/", "/api/v1/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/sessions").permitAll()
                        .requestMatchers("/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/users").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/requests").hasAnyRole("EMPLOYEE", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/requests/*/assignment").hasRole("MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/requests/*/estimates").hasRole("TECHNICIAN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/estimates/*/decision").hasRole("FINANCE")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/requests/*/override-review").hasRole("FINANCE")
                        .anyRequest().authenticated())
                .oauth2ResourceServer(rs -> rs
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(currentUserConverter))
                        .authenticationEntryPoint(problems)
                        .accessDeniedHandler(problems))
                .exceptionHandling(e -> e.authenticationEntryPoint(problems).accessDeniedHandler(problems));
        return http.build();
    }

    @Bean
    JwtDecoder jwtDecoder(AppProperties properties) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withSecretKey(TokenService.signingKey(properties.security().jwtSecret()))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(TokenService.ISSUER)));
        return decoder;
    }

    @Bean
    Converter<Jwt, AbstractAuthenticationToken> currentUserConverter(UserRepository users) {
        return jwt -> {
            UUID id;
            try {
                id = UUID.fromString(jwt.getSubject());
            } catch (IllegalArgumentException | NullPointerException e) {
                throw new InvalidBearerTokenException("The token has no valid subject.");
            }
            CurrentUser user = users.findById(id)
                    .orElseThrow(() -> new InvalidBearerTokenException("This account no longer exists."));
            return UsernamePasswordAuthenticationToken.authenticated(user, jwt,
                    List.of(new SimpleGrantedAuthority("ROLE_" + user.role().name())));
        };
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
