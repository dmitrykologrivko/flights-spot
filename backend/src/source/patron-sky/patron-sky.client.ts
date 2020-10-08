import fetch from 'node-fetch';
import { Injectable } from '@nestjs/common';
import { Result, Ok, Err } from '@nestjs-boilerplate/core';
import { PatronSkyApiException } from './patron-sky-api.exception';

const AIRCRAFTS_API_PATH = 'aircrafts';
const AIRLINES_API_PATH = 'airlines';
const AIRPORTS_API_PATH = 'airports';
const FLIGHTS_API_PATH = 'flights/number';

interface Aircraft {
    name: string;
    isoCode: string;
    dafifCode: string;
}

interface Airline {
    name: string;
    alias: string;
    iata: string;
    icao: string;
    callsign: string;
    country: string;
}

interface Airport {
    name: string;
    city: string;
    country: string;
    iata: string;
    icao: string;
    latitude: number;
    longitude: number;
    altitude: number;
    timezone: number;
    tzDatabase: string;
}

interface FlightAirportMovement {
    actualTimeLocal: string;
    actualTimeUtc: string;
    scheduledTimeLocal: string;
    scheduledTimeUtc: string;
    airport: {
        name: string;
        iata: string;
        icao: string;
    };
}

interface Flight {
    aircraft: {
        name: string;
        reg: string;
    };
    airline: {
        name: string;
    };
    arrival: FlightAirportMovement;
    departure: FlightAirportMovement;
    distance: {
        feet: number;
        km: number;
        meter: number;
        mile: number;
        nm: number;
    };
    number: string;
    callSign: string;
    status: FlightStatusEnum;
}

export enum FlightStatusEnum {
    UNKNOWN = 'Unknown',
    EXPECTED = 'Expected',
    EN_ROUTE = 'EnRoute',
    CHECK_IN = 'CheckIn',
    BOARDING = 'Boarding',
    GATE_CLOSED = 'GateClosed',
    DEPARTED = 'Departed',
    DELAYED = 'Delayed',
    APPROACHING = 'Approaching',
    ARRIVED = 'Arrived',
    CANCELED = 'Canceled',
    DIVERTED = 'Diverted',
    CANCELED_UNCERTAIN ='CanceledUncertain',
}

/**
 * PatronSky API client
 */
@Injectable()
export class PatronSkyClient {
    constructor(private apiUrl: string) {}

    async getAircrafts(): Promise<Result<Aircraft[], PatronSkyApiException>> {
        try {
            const aircrafts = await this.fetchData<Aircraft[]>(`${this.apiUrl}/${AIRCRAFTS_API_PATH}`);
            return Ok(aircrafts);
        } catch (e) {
            return Err(new PatronSkyApiException(e.stack));
        }
    }

    async getAirlines(): Promise<Result<Airline[], PatronSkyApiException>> {
        try {
            const airlines = await this.fetchData<Airline[]>(`${this.apiUrl}/${AIRLINES_API_PATH}`);
            return Ok(airlines);
        } catch (e) {
            return Err(new PatronSkyApiException(e.stack));
        }
    }

    async getAirports(): Promise<Result<Airport[], PatronSkyApiException>> {
        try {
            const airports = await this.fetchData<Airport[]>(`${this.apiUrl}/${AIRPORTS_API_PATH}`);
            return Ok(airports);
        } catch (e) {
            return Err(new PatronSkyApiException(e.stack));
        }
    }

    async getFlights(
        flightNumber: string,
        dataLocal: string,
    ): Promise<Result<Flight[], PatronSkyApiException>> {
        try {
            const url = `${this.apiUrl}/${FLIGHTS_API_PATH}/${flightNumber}/${dataLocal}`;
            const flights = await this.fetchData<Flight[]>(url);
            return Ok(flights);
        } catch (e) {
            return Err(new PatronSkyApiException(e.stack));
        }
    }

    private async fetchData<T>(
        url: string,
        headers: Record<string, string> = {},
        method = 'GET',
    ): Promise<T> {
        const response = await fetch(url, {
            headers,
            method,
        });
        return await response.json() as T;
    }
}
