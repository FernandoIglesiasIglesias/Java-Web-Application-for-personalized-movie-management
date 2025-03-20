package com.tfg.tfg.rest.common;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    private static final String USER = "USER";
    private static final String ADMIN = "ADMIN";

    @Bean
    protected SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    
        // @formatter:off
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
            
                .requestMatchers(antMatcher("/h2-console/**")).permitAll()
                .requestMatchers(antMatcher("/users/signUp")).permitAll()
                .requestMatchers(antMatcher("/users/login")).permitAll()
                .requestMatchers(antMatcher("/users/loginFromServiceToken")).permitAll()
                .requestMatchers(antMatcher("/movies/saveMovie")).permitAll()
                .requestMatchers(antMatcher("/users/{id}")).hasRole(USER)
                .requestMatchers(antMatcher("/users/{id}/changePassword")).hasRole(USER)
                .requestMatchers(antMatcher("/movies/allMovies")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/movies/{id}")).hasAnyRole(USER, ADMIN)
                // CustomList endpoints

                .requestMatchers(antMatcher("/lists")).hasRole(USER)
                .requestMatchers(antMatcher("/lists/{id}")).hasRole(USER)
                .requestMatchers(antMatcher("/lists/{listId}/movies")).hasRole(USER)
                .requestMatchers(antMatcher("/lists/{listId}/movies/{movieId}")).hasRole(USER)

                // Actor endpoints
                .requestMatchers(antMatcher("/actors/all")).permitAll()
                .requestMatchers(antMatcher("/actors/{id}")).permitAll()
                .requestMatchers(antMatcher("/actors/name")).permitAll()
                .requestMatchers(antMatcher("/actors/name/{firstName}/{lastName}")).permitAll()

                // ActorList endpoints
                .requestMatchers(antMatcher("/actor-lists/user/{userId}")).hasRole(USER)
                .requestMatchers(antMatcher("/actor-lists/{listId}")).hasRole(USER)
                .requestMatchers(antMatcher("/actor-lists")).hasRole(USER)
                .requestMatchers(antMatcher("/actor-lists/{listId}/actors/{actorId}")).hasRole(USER)

                // DirectorList endpoints (nuevos)
                .requestMatchers(antMatcher("/director-lists/user/{userId}")).hasRole(USER)
                .requestMatchers(antMatcher("/director-lists/{listId}")).hasRole(USER)
                .requestMatchers(antMatcher("/director-lists")).hasRole(USER)
                .requestMatchers(antMatcher("/director-lists/{listId}/directors/{directorId}")).hasRole(USER)

                // DirectorList endpoints (nuevos)
                .requestMatchers(antMatcher("/director-lists/user/{userId}")).hasRole(USER)
                .requestMatchers(antMatcher("/director-lists/{listId}")).hasRole(USER)
                .requestMatchers(antMatcher("/director-lists")).hasRole(USER)
                .requestMatchers(antMatcher("/director-lists/{listId}/directors/{directorId}")).hasRole(USER)

                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions().disable()) 
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        // @formatter:on
    
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*"); // Permitir todas las solicitudes desde cualquier origen
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}