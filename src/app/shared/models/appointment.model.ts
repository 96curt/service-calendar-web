import { formatDate } from '@angular/common';
import { template } from 'devextreme/core/templates/template';
import { Appointment as DxSchedulerAppointment } from 'devextreme/ui/scheduler';
import { environment } from 'environments/environment';
import { Schedule, TypeEnum } from 'openapi';
export type Appointment = Schedule & DxSchedulerAppointment & {parentId?:number};
export class AppointmentModel implements Appointment{
    [x: string]: any;
    id: number = -1;
    label: string = "Create a new appointment";
    startDateTime: string;
    endDateTime: string;
    confirmed: boolean = false;
    description?: string | undefined;
    travelHours: string = "0.0";
    returnHours: string = "0.0";
    allDay?: boolean | undefined;
    recurrenceRule?: string | undefined;
    addendum?: number | null | undefined;
    serviceCenter: number = -1;
    scheduledBy?: number | null | undefined;
    confirmedBy?: number | null | undefined;
    technicians: number[] = [];
    type?: TypeEnum | undefined;
    addendumLaborHours: string = "0.0";
    addendumName: string = "";
    billingCustName: string = "";
    JobsiteAddress: string = "";
    disabled?: boolean | undefined;
    html?: string | undefined;
    template?: ((template | ((itemData: this, itemIndex: number, itemElement: HTMLElement) => string | Element)) & template) | undefined;
    text?: string | undefined;
    visible?: boolean | undefined;
    endDate?: string | Date | undefined;
    endDateTimeZone?: string | undefined;
    recurrenceException?: string | undefined;
    startDate?: string | Date | undefined;
    startDateTimeZone?: string | undefined;
    parentId?: number | undefined;

    public constructor(init?:Partial<AppointmentModel>) {
        this.startDate = new Date();
        this.endDate = new Date(this.startDate);
        this.endDate.setHours(this.endDate.getHours() + 1);
        this.startDateTime = formatDate(this.startDate,environment.dateTimeFormat, 'en-US');
        this.endDateTime = formatDate(this.endDate, environment.dateTimeFormat, 'en-US');
        
        if (init) {
            Object.assign(this, init);
        }
    }

}
