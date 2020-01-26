import { bootstrapApplication } from '@core/bootstrap';
import { AppModule } from './app.module';

bootstrapApplication({ module: AppModule })
    .then(bootstrapper => bootstrapper.start());
