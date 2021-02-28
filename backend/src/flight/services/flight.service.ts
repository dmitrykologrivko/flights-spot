import { Repository, SelectQueryBuilder, Like } from 'typeorm';
import {
    ApplicationService,
    InjectRepository,
    ClassTransformer,
    ClassValidator,
    ValidationContainerException,
    BaseCrudService,
    CrudOperations,
    InputWrapper,
    PagePagination,
    PaginatedContainer,
    AsyncResult,
    Result,
    ok,
    err,
    merge,
    proceed,
} from '@nestjs-boilerplate/core';
import { User } from '@nestjs-boilerplate/auth';
import {
    BaseFlightSource,
    FlightDto as SourceFlight,
    AirportCodeType,
    SourceException,
} from '@source/base';
import { Aircraft } from '@aircraft/aircraft.entity';
import { Airline } from '@airline/airline.entity';
import { Airport } from '@airport/airport.entity';
import { Flight, FlightType } from '../entities/flight.entity';
import { FlightArrivalAirportMovement } from '../entities/flight-arrival-airport-movement.value-object';
import { FlightDepartureAirportMovement } from '../entities/flight-departure-airport-movement.value-object';
import { FlightDistance } from '../entities/flight-distance.value-object';
import { FlightTicket } from '../entities/flight-ticket.value-object';
import { UserFlightDto } from '../dto/user-flight/user-flight.dto';
import { UserFlightTicketDto } from '../dto/user-flight/user-flight-ticket.dto';
import { FlightAircraftDto } from '../dto/flight/flight-aircraft.dto';
import { FlightAirportMovementDto } from '../dto/flight/flight-airport-movement.dto';
import { FlightDistanceDto } from '../dto/flight/flight-distance.dto';
import { GetFlightsInput } from '../dto/get-flights.input';
import { RetrieveFlightInput } from '../dto/retrieve-flight.input';
import { DestroyFlightInput } from '../dto/destroy-flight.input';
import { LookupFlightInput } from '../dto/lookup-flight.input';
import { LookupFlightOutput } from '../dto/lookup-flight.output';
import { FlightNotFoundException } from '../exceptions/flight-not-found.exception';
import { SeveralFlightsFoundException } from '../exceptions/several-flights-found.exception';
import { IncompleteFlightException } from '../exceptions/incomplete-flight.exception';

type FlightValueObjects = [
    FlightArrivalAirportMovement,
    FlightDepartureAirportMovement,
    FlightTicket,
    FlightDistance
];

type LookupFlightResult = Promise<Result<LookupFlightOutput, ValidationContainerException |
    FlightNotFoundException | SeveralFlightsFoundException |
    IncompleteFlightException | SourceException>>;

@ApplicationService()
export class FlightService extends BaseCrudService<Flight,
    UserFlightDto,
    PaginatedContainer<UserFlightDto>,
    GetFlightsInput,
    RetrieveFlightInput,
    UserFlightDto,
    UserFlightDto,
    DestroyFlightInput> {

    constructor(
        @InjectRepository(Aircraft)
        private readonly aircraftRepository: Repository<Aircraft>,
        @InjectRepository(Airline)
        private readonly airlineRepository: Repository<Airline>,
        @InjectRepository(Airport)
        private readonly airportRepository: Repository<Airport>,
        @InjectRepository(Flight)
        private readonly flightRepository: Repository<Flight>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly flightSource: BaseFlightSource,
    ) {
        super(
            flightRepository,
            {
                entityCls: Flight,
                dtoCls: UserFlightDto,
                createInputCls: UserFlightDto,
                updateInputCls: UserFlightDto,
            },
        );
    }

    protected getPagination(
        input: GetFlightsInput,
    ): (qb: SelectQueryBuilder<Flight>) => PagePagination<Flight> {
        return qb => new PagePagination(qb, input);
    }

    protected getQuery(
        wrapper?: InputWrapper<GetFlightsInput, RetrieveFlightInput, UserFlightDto, UserFlightDto, DestroyFlightInput>,
    ): SelectQueryBuilder<Flight> {
        const query = super.getQuery(wrapper)
            .leftJoinAndSelect(`${this.alias}._aircraft`, 'aircraft')
            .leftJoinAndSelect(`${this.alias}._airline`, 'airline')
            .leftJoinAndSelect(`${this.alias}._arrival._airport`, 'arrivalAirport')
            .leftJoinAndSelect(`${this.alias}._departure._airport`, 'departureAirport')
            .leftJoinAndSelect(`${this.alias}._tickets`, 'ticket')
            .leftJoinAndSelect('ticket._passenger', 'passenger');

        if (wrapper) {
            query.andWhere(qb => {
                const subQuery = qb.subQuery()
                    .select('ticket._parent')
                    .from(FlightTicket, 'ticket')
                    .where('ticket._passenger.id = :user', { user: wrapper.input.userId });
                return `${this.alias}.id IN ${subQuery.getQuery()}`;
            })
        }

        return query;
    }

    protected async performCreateEntity(
        input: UserFlightDto,
    ): Promise<Result<Flight, IncompleteFlightException | SourceException>> {
        if (input.type === FlightType.GENERAL) {
            return FlightTicket.create(
                await this.userRepository.findOne(input.userId),
                input.ticket?.seat,
                input.ticket?.note,
            ).mapErr(() =>
                new IncompleteFlightException()
            ).proceedAsync(async ticket => {
                const flight = await this.getQuery()
                    .andWhere(`${this.alias}.id = :id`, { id: input.parentFlight })
                    .andWhere(`${this.alias}._type = :type`, { type: FlightType.GENERAL })
                    .getOne();

                if (!flight) {
                    return err(new IncompleteFlightException());
                }

                flight.addTicket(ticket);

                return ok(await this.flightRepository.save(flight));
            });
        }

        return merge([
            // Create arrival
            FlightArrivalAirportMovement.create(
                input.arrival.actualTimeLocal,
                input.arrival.actualTimeUtc,
                input.arrival.scheduledTimeLocal,
                input.arrival.scheduledTimeUtc,
                await this.airportRepository.findOne(input.arrival.airportId),
            ).mapErr(() => new IncompleteFlightException()),

            // Create departure
            FlightDepartureAirportMovement.create(
                input.departure.actualTimeLocal,
                input.departure.actualTimeUtc,
                input.departure.scheduledTimeLocal,
                input.departure.scheduledTimeUtc,
                await this.airportRepository.findOne(input.departure.airportId),
            ).mapErr(() => new IncompleteFlightException()),

            // Create flight ticket
            FlightTicket.create(
                await this.userRepository.findOne(input.userId),
                input.ticket?.seat,
                input.ticket?.note,
            ).mapErr(() => new IncompleteFlightException()),
        ]).proceedAsync(async values => {
            const arrival = values[0] as FlightArrivalAirportMovement;
            const departure = values[1] as FlightDepartureAirportMovement;

            // Calculate flight distance between arrival and departure airports
            const getFlightDistanceResult = await this.flightSource.getFlightDistance(
                arrival.airport.iata,
                departure.airport.iata,
                AirportCodeType.IATA,
            );

            return getFlightDistanceResult.proceed(sourceDistance =>
                // Create distance
                FlightDistance.create(
                    sourceDistance.feet,
                    sourceDistance.km,
                    sourceDistance.meter,
                    sourceDistance.mile,
                    sourceDistance.nm,
                ).mapErr(() => new IncompleteFlightException()),
            ).map((distance): FlightValueObjects => [ ...values, distance ]);
        }).then(proceed(async values => {
            const aircraft = await this.aircraftRepository.findOne(input.aircraftId);
            const airline = await this.airlineRepository.findOne(input.airlineId);
            const arrival = values[0] as FlightArrivalAirportMovement;
            const departure = values[1] as FlightDepartureAirportMovement;
            const ticket = values[2];
            const distance = values[3];

            // Create flight
            return Flight.createCustom(
                aircraft,
                input.aircraftReg,
                airline,
                arrival,
                departure,
                distance,
                input.number,
                input.callSign,
                ticket,
            ).mapErr(() =>
                new IncompleteFlightException()
            ).proceedAsync(async flight =>
               ok(await this.flightRepository.save(flight))
            );
        }));
    }

    protected async performUpdateEntity(
        input: UserFlightDto,
        entity: Flight
    ): Promise<Result<Flight, IncompleteFlightException | SourceException>> {
        if (entity.type === FlightType.GENERAL) {
            if (!input.ticket) {
                return ok(entity);
            }

            return FlightTicket.create(
                await this.userRepository.findOne(input.userId),
                input.ticket?.seat,
                input.ticket?.note,
            ).mapErr(() =>
                new IncompleteFlightException()
            ).proceed(ticket =>
                entity.changeTicket(ticket).mapErr(() => new IncompleteFlightException())
            ).proceedAsync(async () =>
                ok(await this.flightRepository.save(entity))
            );
        }

        return merge([
            input.arrival
                ? FlightArrivalAirportMovement.create(
                    input.arrival.actualTimeLocal,
                    input.arrival.actualTimeUtc,
                    input.arrival.scheduledTimeLocal,
                    input.arrival.scheduledTimeUtc,
                    await this.airportRepository.findOne(input.arrival.airportId),
                ).mapErr(() => new IncompleteFlightException())
                : ok(null),

            input.departure
                ? FlightDepartureAirportMovement.create(
                    input.departure.actualTimeLocal,
                    input.departure.actualTimeUtc,
                    input.departure.scheduledTimeLocal,
                    input.departure.scheduledTimeUtc,
                    await this.airportRepository.findOne(input.departure.airportId),
                ).mapErr(() => new IncompleteFlightException())
                : ok(null),

            input.ticket
                ? FlightTicket.create(
                    await this.userRepository.findOne(input.userId),
                    input.ticket?.seat,
                    input.ticket?.note,
                ).mapErr(() => new IncompleteFlightException())
                : ok(null),
        ]).proceedAsync(async values => {
            let arrival = values[0] as FlightArrivalAirportMovement;
            let departure = values[1] as FlightDepartureAirportMovement;

            if (!(arrival && departure)) {
                return ok([ ...values, null ] as FlightValueObjects);
            }

            if (!arrival) {
                arrival = entity.arrival;
            }
            if (!departure) {
                departure = entity.departure;
            }

            // Calculate flight distance between arrival and departure airports
            const getFlightDistanceResult = await this.flightSource.getFlightDistance(
                arrival.airport.iata,
                departure.airport.iata,
                AirportCodeType.IATA,
            );

            return getFlightDistanceResult.proceed(sourceDistance =>
                // Create distance
                FlightDistance.create(
                    sourceDistance.feet,
                    sourceDistance.km,
                    sourceDistance.meter,
                    sourceDistance.mile,
                    sourceDistance.nm,
                ).mapErr(() => new IncompleteFlightException()),
            ).map((distance): FlightValueObjects => [ ...values, distance ]);
        }).then(proceed(async values => {
            const aircraft = input.aircraftId
                 ? await this.aircraftRepository.findOne(input.aircraftId)
                 : null;
            const airline = input.airlineId
                ? await this.airlineRepository.findOne(input.airlineId)
                : null;
            const arrival = values[0] as FlightArrivalAirportMovement;
            const departure = values[1] as FlightDepartureAirportMovement;
            const ticket = values[2];
            const distance = values[3];

            return ok(null)
                .proceed(() => {
                    if (aircraft) {
                        return entity.changeAircraft(aircraft);
                    }
                    return ok(null);
                }).proceed(() => {
                    if (input.aircraftReg) {
                        return entity.changeAircraftReg(input.aircraftReg);
                    }
                    return ok(null);
                }).proceed(() => {
                    if (airline) {
                        return entity.changeAirline(airline);
                    }
                    return ok(null);
                }).proceed(() => {
                    if (arrival) {
                        return entity.changeArrival(arrival);
                    }
                    return ok(null);
                }).proceed(() => {
                    if (departure) {
                        return entity.changeDeparture(departure);
                    }
                    return ok(null);
                }).proceed(() => {
                    if (distance) {
                        return entity.changeDistance(distance);
                    }
                    return ok(null);
                }).proceed(() => {
                    if (input.number) {
                        return entity.changeNumber(input.number);
                    }
                    return ok(null);
                }).proceed(() => {
                    if (input.callSign) {
                        return entity.changeCallSign(input.callSign);
                    }
                    return ok(null);
                }).proceed(() => {
                    if (ticket) {
                        return entity.changeTicket(ticket);
                    }
                    return ok(null);
                }).mapErr(() =>
                    new IncompleteFlightException()
                ).proceedAsync(async () =>
                    ok(await this.flightRepository.save(entity))
                );
        })) as Promise<Result<Flight, IncompleteFlightException | SourceException>>;
    }

    protected async performDestroyEntity(
        input: DestroyFlightInput,
        entity: Flight,
    ): Promise<Result<void, void>> {
        if (entity.type === FlightType.CUSTOM) {
            return super.performDestroyEntity(input, entity);
        }

        entity.removeTicket(
            entity.findTicketByPassengerId(input.userId),
        );

        await this.flightRepository.save(entity);
        return ok(null);
    }

    protected mapListDto(
        entities: Flight[],
        input?: GetFlightsInput,
    ): UserFlightDto[] {
        return entities.map(entity => this.mapUserFlightDto(entity, input.userId));
    }

    protected mapDtoOutput(
        entity: Flight,
        wrapper?: InputWrapper<void, RetrieveFlightInput, UserFlightDto, UserFlightDto, DestroyFlightInput>,
    ): UserFlightDto {
        return this.mapUserFlightDto(entity, (wrapper.input as any).userId);
    }

    async lookupFlight(input: LookupFlightInput): LookupFlightResult {
        // Validate input
        return AsyncResult.from(ClassValidator.validate(LookupFlightInput, input))
            // Find already created flight in the database
            .proceed(async () => {
                return ok(
                    await this.getQuery()
                        // TODO: dateLocal
                        .andWhere(`${this.alias}._type = :type`, { type: FlightType.GENERAL })
                        .andWhere(`${this.alias}._number = :number`, { number: input.flightNumber })
                        .getOne(),
                );
            })
            .proceed(flight => {
                if (flight) {
                    return ok(flight);
                }

                // Find flight from the external source
                return this.findFlightFromSource(input.flightNumber, input.dateLocal);
            })
            // Map to DTO
            .map(flight =>
                ClassTransformer.toClassObject(LookupFlightOutput, flight, { groups: [CrudOperations.READ] })
            )
            .toPromise();
    }

    private async findFlightFromSource(flightNumber: string, dateLocal: string) {
        return (await this.flightSource.getFlights(flightNumber, dateLocal))
            .proceed(flights => {
                if (flights.length === 0) {
                    return err(new FlightNotFoundException());
                }

                if (flights.length > 1) {
                    return err(new SeveralFlightsFoundException());
                }

                return ok(flights[0]);
            })
            .proceedAsync(async (sourceFlight: SourceFlight) => {
                const aircraft = await this.aircraftRepository.findOne({
                    where: [
                        { _iata: sourceFlight.aircraft.iata },
                        { _icao: sourceFlight.aircraft.icao },
                        { _name: Like(`%${sourceFlight.aircraft.name}%`) },
                    ]
                });

                const airline = await this.airlineRepository.findOne({
                    where: [
                        { _iata: sourceFlight.airline.iata },
                        { _icao: sourceFlight.airline.icao },
                        { _name: Like(`%${sourceFlight.airline.name}%`) },
                    ]
                });

                const departureAirport = await this.airportRepository.findOne({
                    where: [
                        { _iata: sourceFlight.departure.airport.iata },
                        { _icao: sourceFlight.departure.airport.icao },
                        { _name: Like(`%${sourceFlight.departure.airport.name}%`) },
                    ]
                });

                const arrivalAirport = await this.airportRepository.findOne({
                    where: [
                        { _iata: sourceFlight.arrival.airport.iata },
                        { _icao: sourceFlight.arrival.airport.icao },
                        { _name: Like(`%${sourceFlight.arrival.airport.name}%`) },
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
                    ).map_err(() => new IncompleteFlightException()),

                    // Create departure
                    FlightDepartureAirportMovement.create(
                        sourceFlight.departure.actualTimeLocal,
                        sourceFlight.departure.actualTimeUtc,
                        sourceFlight.departure.scheduledTimeLocal,
                        sourceFlight.departure.scheduledTimeUtc,
                        departureAirport,
                    ).map_err(() => new IncompleteFlightException()),

                    // Create distance
                    FlightDistance.create(
                        sourceFlight.distance.feet,
                        sourceFlight.distance.km,
                        sourceFlight.distance.meter,
                        sourceFlight.distance.mile,
                        sourceFlight.distance.nm,
                    ).map_err(() => new IncompleteFlightException()),
                ]).proceed(valueObjects =>
                    // Create flight
                    Flight.createGeneral(
                        aircraft,
                        sourceFlight.aircraft.reg,
                        airline,
                        valueObjects[0] as FlightArrivalAirportMovement,
                        valueObjects[1] as FlightDepartureAirportMovement,
                        valueObjects[2],
                        sourceFlight.number,
                        sourceFlight.callSign,
                        sourceFlight.status,
                    ).map_err(() => new IncompleteFlightException())
                ).proceedAsync(async flight =>
                    // Cache flight in the database
                    ok(await this.flightRepository.save(flight))
                )
            });
    }

    private mapUserFlightDto(flight: Flight, userId: number): UserFlightDto {
        const groups = [CrudOperations.READ];
        return {
            id: flight.id,
            created: flight.created,
            updated: flight.updated,
            aircraft: ClassTransformer.toClassObject(
                FlightAircraftDto,
                flight.aircraft,
                { groups }
            ),
            aircraftReg: flight.aircraftReg,
            airline: ClassTransformer.toClassObject(
                FlightAircraftDto,
                flight.airline,
                { groups }
            ),
            arrival: ClassTransformer.toClassObject(
                FlightAirportMovementDto,
                flight.arrival,
                { groups },
            ),
            departure: ClassTransformer.toClassObject(
                FlightAirportMovementDto,
                flight.departure,
                { groups },
            ),
            distance: ClassTransformer.toClassObject(
                FlightDistanceDto,
                flight.distance,
                { groups },
            ),
            number: flight.number,
            callSign: flight.callSign,
            status: flight.status,
            type: flight.type,
            ticket: ClassTransformer.toClassObject(
                UserFlightTicketDto,
                flight.findTicketByPassengerId(userId),
                { groups },
            ),
        } as UserFlightDto;
    }
}
