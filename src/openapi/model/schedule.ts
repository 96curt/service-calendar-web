/**
 * Service Calendar API
 * Mockup Service Calendar API
 *
 * The version of the OpenAPI document: 0.10.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


export interface Schedule { 
    readonly id: number;
    readonly label: string;
    startDateTime: string;
    endDateTime: string;
    confirmed?: boolean;
    description?: string | null;
    travelHours: string;
    allDay?: boolean;
    recurrenceRule?: string | null;
    addendum?: number | null;
    serviceCenter: number;
    scheduledBy?: number | null;
    confirmedBy?: number | null;
    technicians: Array<number>;
}

