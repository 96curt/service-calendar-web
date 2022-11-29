/**
 * Service Calendar API
 * Mockup Service Calendar API
 *
 * The version of the OpenAPI document: 0.7.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { WarrantyCodeEnum } from './warrantyCodeEnum';
import { ServiceCodeEnum } from './serviceCodeEnum';


export interface OrderItem { 
    readonly id: number;
    readonly number: number;
    partOrder: string;
    partItem: string;
    partDesc: string;
    serviceCode: ServiceCodeEnum;
    warrantyCode: WarrantyCodeEnum;
    addendum: number;
}

