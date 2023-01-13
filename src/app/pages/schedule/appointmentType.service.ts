import { Injectable } from '@angular/core';
import { TypeEnum } from 'openapi'

export interface AppointmentType {
    id: TypeEnum,
    type: string,
    color: string
}

const appointmentTypes: AppointmentType[] = [{
    id: TypeEnum.Ordr,
    type: 'service-order',
    color: '#cb6bb2'
},
{
    id: TypeEnum.Trvl,
    type: 'travel-time',
    color: '#56ca85'
},
{
    id: TypeEnum.Misc,
    type: 'misc',
    color: '#1e90ff'
}]

@Injectable()
export class AppointmentTypeService {
    getAppointmentTypes(){
        return appointmentTypes
    }
}

