import { Injectable } from '@angular/core';
import { TypeEnum } from 'openapi';

export interface AppointmentType {
    id: TypeEnum,
    desc: string,
//    color: string
};

const appointmentTypes: AppointmentType[] = [{
    id: TypeEnum.Ordr,
    desc: 'Service Order',
//    color: '#1e90ff'
},
{
    id: TypeEnum.Trvl,
    desc: 'Travel Time',
//    color: '#6cb1b1'
},
{
    id: TypeEnum.Misc,
    desc: 'Misc',
//    color: '#c890ff'
}];

@Injectable()
export class AppointmentTypeService {
    getAppointmentTypes() {
        return appointmentTypes;
    }
}

