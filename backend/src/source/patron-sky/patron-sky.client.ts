import fetch from 'node-fetch';
import { Injectable } from '@nestjs/common';
import { Result, ok, err } from '@nestjs-boilerplate/core';
import { PatronSkyApiException } from './patron-sky-api.exception';

const AIRCRAFTS_API_PATH = 'api/aircrafts';
const AIRLINES_API_PATH = 'api/airlines';
const AIRPORTS_API_PATH = 'api/airports';
const FLIGHTS_API_PATH = 'api/flights';

export interface Aircraft {
    name: string;
    iataCode: string;
    isoCode: string;
}

export interface Airline {
    name: string;
    alias: string;
    iata: string;
    icao: string;
    callsign: string;
    country: string;
}

export interface Airport {
    name: string;
    city: string;
    country: string;
    iata: string;
    icao: string;
    latitude: number;
    longitude: number;
    utc: number;
}

export interface FlightAirportMovement {
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

export interface FlightDistance {
    feet: number;
    km: number;
    meter: number;
    mile: number;
    nm: number;
}

export interface Flight {
    aircraft: {
        name: string;
        reg: string;
    };
    airline: {
        name: string;
    };
    arrival: FlightAirportMovement;
    departure: FlightAirportMovement;
    distance: FlightDistance;
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

export enum AirportCodesBy {
    IATA = 'iata',
    ICAO = 'icao',
}

/**
 * PatronSky API client
 */
@Injectable()
export class PatronSkyClient {
    constructor(private readonly host: string) {
        if (!this.host.endsWith('/')) {
            this.host = `${host}/`;
        }
    }

    async getAircrafts(): Promise<Result<Aircraft[], PatronSkyApiException>> {
        try {
            return ok(
                await this.fetchData<Aircraft[]>(`${this.host}${AIRCRAFTS_API_PATH}`)
            );
        } catch (e) {
            return err(new PatronSkyApiException(e.stack));
        }
    }

    async getAirlines(): Promise<Result<Airline[], PatronSkyApiException>> {
        try {
            return ok(
                await this.fetchData<Airline[]>(`${this.host}${AIRLINES_API_PATH}`)
            );
        } catch (e) {
            return err(new PatronSkyApiException(e.stack));
        }
    }

    async getAirports(): Promise<Result<Airport[], PatronSkyApiException>> {
        try {
            return ok(
                await this.fetchData<Airport[]>(`${this.host}${AIRPORTS_API_PATH}`)
            );
        } catch (e) {
            return err(new PatronSkyApiException(e.stack));
        }
    }

    async getFlights(
        flightNumber: string,
        dataLocal: string,
    ): Promise<Result<Flight[], PatronSkyApiException>> {
        try {
            const url = `${this.host}${FLIGHTS_API_PATH}/number/${flightNumber}/${dataLocal}`;
            return ok(await this.fetchData<Flight[]>(url));
        } catch (e) {
            return err(new PatronSkyApiException(e.stack));
        }
    }

    async getFlightDistance(
        from: string,
        to: string,
        codeType: AirportCodesBy,
    ): Promise<Result<FlightDistance, PatronSkyApiException>> {
        try {
            const url = `${this.host}${FLIGHTS_API_PATH}/distance/${codeType}/${from}/${to}`;
            return ok(await this.fetchData<FlightDistance>(url));
        } catch (e) {
            return err(new PatronSkyApiException(e.stack));
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

        if (!response.ok) {
            throw new PatronSkyApiException(
                `Status: ${response.status} Message: ${await response.text()}`,
            );
        }

        return await response.json() as T;
    }
}
