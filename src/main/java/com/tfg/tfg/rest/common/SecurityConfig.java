package com.tfg.tfg.rest.common;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

import org.apache.catalina.filters.CorsFilter;
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
                .requestMatchers(antMatcher("/users/{id}")).hasRole(USER)
                .requestMatchers(antMatcher("/users/{id}/changePassword")).hasRole(USER)
                .requestMatchers(antMatcher("/movies/allMovies")).permitAll()
                .requestMatchers(antMatcher("/movies/{id}")).hasAnyRole(USER, ADMIN)
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions().disable()) // Permitir cargar la consola H2 en un iframe
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
