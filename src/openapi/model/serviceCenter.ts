/**
 * Service Calendar API
 * Mockup Service Calendar API
 *
 * The version of the OpenAPI document: 0.8.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { ManagerEnum } from './managerEnum';
import { StateEnum } from './stateEnum';


export interface ServiceCenter { 
    readonly id: number;
    street: string;
    street2?: string;
    city: string;
    state: StateEnum;
    zipCode: string;
    country?: string;
    county: string;
    latitude?: number | null;
    longitute?: number | null;
    name: string;
    manager: ManagerEnum;
    region: number;
}

