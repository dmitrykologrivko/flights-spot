import { Module } from '@nestjs/common';
import { CoreModule } from '@nestjs-boilerplate/core';
import { AuthModule } from '@nestjs-boilerplate/auth';
import { AircraftModule } from '@aircraft/aircraft.module';
import { AirlineModule } from '@airline/airline.module';
import { AirportModule } from '@airport/airport.module';
import { FlightModule } from '@flight/flight.module';
import appConfig from './app.config';

@Module({
  imports: [
      CoreModule.forRoot({
          config: {
              load: [appConfig]
          }
      }),
      AuthModule.forRoot(),
      AircraftModule,
      AirlineModule,
      AirportModule,
      FlightModule,
  ]
})
export class AppModule {}
