package ng.tesa.genie;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Genie: maintenance requests from reported fault to verified repair. */
@SpringBootApplication
public class GenieApplication {

    public static void main(String[] args) {
        SpringApplication.run(GenieApplication.class, args);
    }
}
