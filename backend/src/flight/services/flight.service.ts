import {
    DataSource,
    QueryRunner,
    SelectQueryBuilder,
    Like,
    Equal,
} from 'typeorm';
import {
    merge,
    ok,
    err,
    proceed,
    mapErr,
    Result,
    ApplicationService,
    InjectRepository,
    BaseCrudService,
    InputWrapper,
    CreateInput,
    DestroyInput,
    ListInput,
    PagePagination,
    PaginatedContainer,
    RetrieveInput,
    UpdateInput,
    ValidationContainerException,
    ClassValidator,
    ClassTransformer,
    CrudOperations,
} from '@nestjs-boilerplate/core';
import { User } from '@nestjs-boilerplate/user';
import {
    AirportCodeType,
    BaseFlightSource,
    SourceException,
    FlightDto as SourceFlightDto
} from '@source/base';
import { Aircraft } from '@aircraft/aircraft.entity';
import { Airline } from '@airline/airline.entity';
import { Airport } from '@airport/airport.entity';
import { Flight, FlightDistanceProvider } from '../entities/flight.entity';
import { FlightArrivalAirportMovement } from '../entities/flight-arrival-airport-movement.value-object';
import { FlightDepartureAirportMovement } from '../entities/flight-departure-airport-movement.value-object';
import { FlightDistance } from '../entities/flight-distance.value-object';
import { FlightTicket } from '../entities/flight-ticket.value-object';
import { FlightDto } from '../dto/flight/flight.dto';
import { LookupFlightInput } from '../dto/lookup-flight.input';
import { LookupFlightOutput } from '../dto/lookup-flight.output';
import { FlightNotFoundException } from '../exceptions/flight-not-found.exception';
import { SeveralFlightsFoundException } from '../exceptions/several-flights-found.exception';
import { IncompleteFlightException } from '../exceptions/incomplete-flight.exception';

type LookupFlightResult = Promise<Result<LookupFlightOutput, ValidationContainerException |
    FlightNotFoundException | SeveralFlightsFoundException |
    IncompleteFlightException | SourceException>>;

@ApplicationService()
export class FlightService extends BaseCrudService<Flight,
    FlightDto,
    ListInput,
    FlightDto,
    PaginatedContainer<FlightDto>> {

    constructor(
        protected dataSource: DataSource,
        private readonly flightSource: BaseFlightSource,
    ) {
        super(
            dataSource,
            {
                entityCls: Flight,
                listOutputCls: FlightDto,
                retrieveOutputCls: FlightDto,
                createPayloadCls: FlightDto,
                createOutputCls: FlightDto,
                updatePayloadCls: FlightDto,
                updateOutputCls: FlightDto,
            },
        );
    }

    protected getPagination(input: ListInput, qb: SelectQueryBuilder<Flight>) {
        return new PagePagination<Flight>(qb, input);
    }

    protected getQuery(
        queryRunner: QueryRunner,
        wrapper?: InputWrapper<ListInput, RetrieveInput, CreateInput<FlightDto>, UpdateInput<FlightDto>, DestroyInput>
    ): SelectQueryBuilder<Flight> {
        return super.getQuery(queryRunner, wrapper)
            .leftJoinAndSelect(`${this.alias}.aircraft`, 'aircraft')
            .leftJoinAndSelect(`${this.alias}.airline`, 'airline')
            .leftJoinAndSelect(`${this.alias}.arrival.airport`, 'arrivalAirport')
            .leftJoinAndSelect(`${this.alias}.departure.airport`, 'departureAirport')
            .leftJoinAndSelect(`${this.alias}.user`, 'user')
            .where('user.id = :user', { user: wrapper.input.extra?.user?.id });
    }

    protected async performCreateEntity(
        input: CreateInput<FlightDto>,
        queryRunner: QueryRunner
    ): Promise<Result<Flight, IncompleteFlightException | SourceException>> {
        const arrivalAirport = await queryRunner.manager.findOneBy(
            Airport,
            { id: Equal(input.payload.arrival.airportId) }
        );
        const departureAirport = await queryRunner.manager.findOneBy(
            Airport,
            { id: Equal(input.payload.departure.airportId) }
        );

        return merge([
            // Create arrival
            FlightArrivalAirportMovement.create(
                input.payload.arrival.actualTimeLocal,
                input.payload.arrival.actualTimeUtc,
                input.payload.arrival.scheduledTimeLocal,
                input.payload.arrival.scheduledTimeUtc,
                arrivalAirport,
            ).mapErr(() => new IncompleteFlightException()),

            // Create departure
            FlightDepartureAirportMovement.create(
                input.payload.departure.actualTimeLocal,
                input.payload.departure.actualTimeUtc,
                input.payload.departure.scheduledTimeLocal,
                input.payload.departure.scheduledTimeUtc,
                departureAirport,
            ).mapErr(() => new IncompleteFlightException()),

            // Create flight ticket
            FlightTicket.create(
                input.payload.ticket?.seat,
                input.payload.ticket?.note,
            ).mapErr(() => new IncompleteFlightException()),
        ]).proceedAsync(async values => {
            const aircraft = await queryRunner.manager.findOneBy(Aircraft, { id: Equal(input.payload.aircraftId) });
            const airline = await queryRunner.manager.findOneBy(Airline,  { id: Equal(input.payload.airlineId) });
            const arrival = values[0] as FlightArrivalAirportMovement;
            const departure = values[1] as FlightDepartureAirportMovement;
            const ticket = values[2];

            // Create flight
            return Flight.create(
                aircraft,
                input.payload.aircraftReg,
                airline,
                arrival,
                departure,
                input.payload.number,
                input.payload.callSign,
                input.payload.status,
                ticket,
                await queryRunner.manager.findOneBy(User, { id: input.extra?.user?.id }),
                this.getFlightDistanceProvider(),
            ).then(mapErr(async () =>
                new IncompleteFlightException())
            ).then(proceed(async flight =>
                ok(await queryRunner.manager.save(flight))
            ));
        });
    }

    protected async performUpdateEntity(
        input: UpdateInput<FlightDto>,
        entity: Flight,
        queryRunner: QueryRunner
    ): Promise<Result<Flight, IncompleteFlightException | SourceException>> {
        const arrivalAirport = await queryRunner.manager.findOneBy(
            Airport,
            { id: Equal(input.payload.arrival?.airportId) }
        );
        const departureAirport = await queryRunner.manager.findOneBy(
            Airport,
            { id: Equal(input.payload.departure?.airportId) }
        );

        return merge([
            input.payload.arrival
                ? FlightArrivalAirportMovement.create(
                    input.payload.arrival.actualTimeLocal,
                    input.payload.arrival.actualTimeUtc,
                    input.payload.arrival.scheduledTimeLocal,
                    input.payload.arrival.scheduledTimeUtc,
                    arrivalAirport,
                ).mapErr(() => new IncompleteFlightException())
                : ok<FlightArrivalAirportMovement, never>(null),

            input.payload.departure
                ? FlightDepartureAirportMovement.create(
                    input.payload.departure.actualTimeLocal,
                    input.payload.departure.actualTimeUtc,
                    input.payload.departure.scheduledTimeLocal,
                    input.payload.departure.scheduledTimeUtc,
                    departureAirport,
                ).mapErr(() => new IncompleteFlightException())
                : ok<FlightArrivalAirportMovement, never>(null),

            input.payload.ticket
                ? FlightTicket.create(
                    input.payload.ticket.seat,
                    input.payload.ticket.note,
                ).mapErr(() => new IncompleteFlightException())
                : ok<FlightTicket, never>(null),
        ]).proceedAsync(async values => {
            const aircraft = await queryRunner.manager.findOneBy(Aircraft, { id: Equal(input.payload.aircraftId) });
            const airline = await queryRunner.manager.findOneBy(Airline,{ id: Equal(input.payload.airlineId) } );
            const arrival = values[0] as FlightArrivalAirportMovement;
            const departure = values[1] as FlightDepartureAirportMovement;
            const ticket = values[2];

            return entity.change({
                    aircraft,
                    aircraftReg: input.payload.aircraftReg,
                    airline,
                    arrival,
                    departure,
                    number: input.payload.number,
                    callSign: input.payload.callSign,
                    status: input.payload.status,
                    ticket
                },
                this.getFlightDistanceProvider(),
            ).then(mapErr(async () =>
                new IncompleteFlightException()
            )).then(proceed(async () =>
                ok(await queryRunner.manager.save(entity))
            ));
        });
    }

    async lookupFlight(input: LookupFlightInput): LookupFlightResult {
        return ClassValidator.validate(LookupFlightInput, input)
            .then(proceed(() => this.flightSource.getFlights(input.flightNumber, input.dateLocal)))
            .then(proceed(async (flights: SourceFlightDto[]) => {
                if (flights.length === 0) {
                    return err(new FlightNotFoundException());
                }

                if (flights.length > 1) {
                    return err(new SeveralFlightsFoundException());
                }

                const sourceFlight: SourceFlightDto = flights[0];

                const aircraft = await this.dataSource.manager.findOne(Aircraft,{
                    where: [
                        { iata: sourceFlight.aircraft.iata },
                        { icao: sourceFlight.aircraft.icao },
                        { name: Like(`%${sourceFlight.aircraft.name}%`) },
                    ]
                });

                const airline = await this.dataSource.manager.findOne(Airline,{
                    where: [
                        { iata: sourceFlight.airline.iata },
                        { icao: sourceFlight.airline.icao },
                        { name: Like(`%${sourceFlight.airline.name}%`) },
                    ]
                });

                const departureAirport = await this.dataSource.manager.findOne(Airport,{
                    where: [
                        { iata: sourceFlight.departure.airport.iata },
                        { icao: sourceFlight.departure.airport.icao },
                        { name: Like(`%${sourceFlight.departure.airport.name}%`) },
                    ]
                });

                const arrivalAirport = await this.dataSource.manager.findOne(Airport,{
                    where: [
                        { iata: sourceFlight.arrival.airport.iata },
                        { icao: sourceFlight.arrival.airport.icao },
                        { name: Like(`%${sourceFlight.arrival.airport.name}%`) },
                    ]
                });

                return merge([
                    // Create arrival
                    FlightArrivalAirportMovement.create(
                        sourceFlight.arrival.actualTimeLocal,
                        sourceFlight.arrival.actualTimeUtc,
                        sourceFlight.arrival.scheduledTimeLocal,
                        sourceFlight.arrival.scheduledTimeUtc,
                        arrivalAirport,
                    ).mapErr(() => new IncompleteFlightException()),

                    // Create departure
                    FlightDepartureAirportMovement.create(
                        sourceFlight.departure.actualTimeLocal,
                        sourceFlight.departure.actualTimeUtc,
                        sourceFlight.departure.scheduledTimeLocal,
                        sourceFlight.departure.scheduledTimeUtc,
                        departureAirport,
                    ).mapErr(() => new IncompleteFlightException()),

                    // Create distance
                    FlightDistance.create(
                        sourceFlight.distance.feet,
                        sourceFlight.distance.km,
                        sourceFlight.distance.meter,
                        sourceFlight.distance.mile,
                        sourceFlight.distance.nm,
                    ).mapErr(() => new IncompleteFlightException()),
                ]).proceed(values => {
                    const arrival = values[0] as FlightArrivalAirportMovement;
                    const departure = values[1] as FlightDepartureAirportMovement;
                    const distance = values[2];

                    return Flight.createGeneral(
                        aircraft,
                        sourceFlight.aircraft.reg,
                        airline,
                        arrival,
                        departure,
                        distance,
                        sourceFlight.number,
                        sourceFlight.callSign,
                        sourceFlight.status,
                    ).mapErr(() =>
                        new IncompleteFlightException()
                    ).map(flight =>
                        ClassTransformer.toClassObject(
                            LookupFlightOutput,
                            flight,
                            { groups: [CrudOperations.READ] }
                        )
                    )
                });
            }));
    }

    private getFlightDistanceProvider(): FlightDistanceProvider {
        return {
            getFlightDistance: async (
                arrivalAirport: Airport,
                departureAirport: Airport
            ) => {
                if (!arrivalAirport || !departureAirport) {
                    return err(new IncompleteFlightException());
                }

                return (await this.flightSource.getFlightDistance(
                    arrivalAirport.iata,
                    departureAirport.iata,
                    AirportCodeType.IATA
                )).mapErr(() => new IncompleteFlightException());
            }
        };
    }
}
