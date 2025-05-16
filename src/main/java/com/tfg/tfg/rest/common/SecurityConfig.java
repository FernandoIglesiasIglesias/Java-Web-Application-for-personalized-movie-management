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
                .requestMatchers(antMatcher("/movies/saveMovie")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/users/{id}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/users/{id}/changePassword")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/movies/allMovies")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/movies/{id}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/users/admin/deleteUser")).hasRole(ADMIN)
                
                // CustomList endpoints
                .requestMatchers(antMatcher("/lists")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/lists/{id}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/lists/{listId}/movies")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/lists/{listId}/movies/{movieId}")).hasAnyRole(USER, ADMIN)

                // Actor endpoints
                .requestMatchers(antMatcher("/actors/all")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/actors/{id}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/actors/imdb/{imdbId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/actors/name/{name}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/actors/create")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/actors/name/{name}")).hasAnyRole(USER, ADMIN)

                // Director endpoints
                .requestMatchers(antMatcher("/directors/all")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/directors/{id}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/directors/imdb/{imdbId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/directors/name/{name}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/directors/create")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/directors/name/{name}")).hasAnyRole(USER, ADMIN)
                
                // ActorList endpoints
                .requestMatchers(antMatcher("/actor-lists/user/{userId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/actor-lists/{listId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/actor-lists")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/actor-lists/{listId}/actors/{actorId}")).hasAnyRole(USER, ADMIN)

                // DirectorList endpoints
                .requestMatchers(antMatcher("/director-lists/user/{userId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/director-lists/{listId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/director-lists")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/director-lists/{listId}/directors/{directorId}")).hasAnyRole(USER, ADMIN)

                // Rating endpoints
                .requestMatchers(antMatcher("/ratings/{userId}/{imdbId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/ratings/movie/{imdbId}/average")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/ratings/user/{userId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/ratings/movie/{imdbId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/ratings/topRated")).hasAnyRole(USER, ADMIN)
                
                // Review endpoints
                .requestMatchers(antMatcher("/reviews")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/reviews/{id}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/reviews/movie/{imdbId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/reviews/user/{userId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/reviews/{id}/vote")).hasAnyRole(USER, ADMIN)
                
                // Recommendation endpoints
                .requestMatchers(antMatcher("/recommendations")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/recommendations/view/{imdbId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/recommendations/rate/{imdbId}")).hasAnyRole(USER, ADMIN)
                .requestMatchers(antMatcher("/recommendations/search")).hasAnyRole(USER, ADMIN)
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