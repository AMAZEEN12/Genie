package ng.tesa.genie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import ng.tesa.genie.config.AppProperties;

/** Genie: maintenance requests from reported fault to verified repair. */
@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class GenieApplication {

    public static void main(String[] args) {
        SpringApplication.run(GenieApplication.class, args);
    }
}
