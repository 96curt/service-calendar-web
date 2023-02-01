import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { DxSchedulerComponent } from 'devextreme-angular';
import { Appointment, AppointmentModel } from '../models/appointment.model';
import { Schedule, TypeEnum } from 'openapi';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor() { }

  /**
   * Creates and returns "Traveling to" and "Traveling from" appointment blocks from service order appointment
   */
  public createTravelAppointments(appointment: Appointment, startingId:number) {
    if(appointment.type!='ORDR')
      return [];
    const travelTime = this.getTravelTimeRange(appointment);
    const returnTime = this.getReturnTimeRange(appointment);
    let newAppointments: Appointment[] = [];
    if(travelTime){
      newAppointments.push({
        id: startingId++,
        parentId:appointment.id,
        technicians: appointment.technicians,
        startDateTime: formatDate(travelTime.start,'YYYY-MM-ddTHH:mm', 'en-US'),
        endDateTime: formatDate(travelTime.end, 'YYYY-MM-ddTHH:mm', 'en-US'),
        label: "Travel Time: " + appointment.travelHours,
        type: TypeEnum.Trvl,
        disabled: true,
        travelHours: '',
        returnHours: '',
        serviceCenter: 0,
        addendumLaborHours: '',
        addendumName: '',
        billingCustName: '',
        JobsiteAddress: '',
      });
    }
    if(returnTime){
      newAppointments.push({
        id: startingId++,
        parentId:appointment.id,
        technicians: appointment.technicians,
        startDateTime: formatDate(returnTime.start,'YYYY-MM-ddTHH:mm', 'en-US'),
        endDateTime: formatDate(returnTime.end, 'YYYY-MM-ddTHH:mm', 'en-US'),
        label: "Return Time: " + appointment.returnHours,
        type: TypeEnum.Trvl,
        disabled: true,
        travelHours: '',
        returnHours: '',
        serviceCenter: 0,
        addendumLaborHours: '',
        addendumName: '',
        billingCustName: '',
        JobsiteAddress: '',
      });
    }
    return newAppointments;
  }

  /**
   * Checks if appointment is valid
   * @param appointment The appointment to validate
   * @param schedule Array of all appointments in calendar, used to check for conflicts
   */
  public isValidAppointment(appointment: Appointment,  scheduler:DxSchedulerComponent) {
    return this.isValidAppointmentInterval(appointment, scheduler);
  }

  /**
   * Checks if appointment time interval is valid for all technicians.
   * includes travel to and from times
   */
  private isValidAppointmentInterval(newAppointment: Appointment, scheduler:DxSchedulerComponent) {
    const travelTime = this.getTravelTimeRange(newAppointment);
    const returnTime = this.getReturnTimeRange(newAppointment);
    const newStart = travelTime ? travelTime.start : new Date(newAppointment.startDateTime);
    const newEnd = returnTime ? returnTime.end : new Date(newAppointment.endDateTime);
    newEnd.setTime(newEnd.getTime() - 1);
    const schedule = scheduler.instance.getDataSource().items() as Appointment[];
    // Check if appointment is out of bounds
    if(newStart.getHours() < scheduler.startDayHour || newEnd.getHours() >= scheduler.endDayHour) {
      return false;
    }
    // Check if appointment conflicts with other appointments
    for(let appointment of schedule) {
      if(appointment.id == newAppointment.id || appointment.parentId == newAppointment.id)
        continue;
      const start = new Date(appointment.startDateTime);
      const end = new Date(appointment.endDateTime);
      for(let technician of newAppointment.technicians) {
        if(!this.isTechAssignedToAppointment(technician, appointment))
          continue;
        if(newEnd > start && newStart < end) {
          return false;
        }
      }
    }
    return true;
  }

  /**
  * Get Appointment "Traveling To Site" Time Range
  */
  private getTravelTimeRange(appointment:Appointment) {
    let end = new Date(appointment.startDateTime);
    let start = new Date(end);
    end.setTime(end.getTime() - 1);
    let returnMinutes = start.getMinutes() - parseFloat(appointment.travelHours) * 60;
    if(returnMinutes >= 0)
      return null;
    start.setMinutes(returnMinutes);
    return {start, end};
  }

  /**
  * Checks if technician is traveling at this time.
  */
  // isTravelTime(technician: number, date: Date) {
  //   const schedule = this.dxScheduler.instance.getDataSource().items() as Appointment[];
  //   for(let appointment of schedule) {
  //     if(!this.isTechAssignedToAppointment(technician, appointment))
  //       continue;
  //     // get appointment travel time
  //     const travelTime = this.getTravelTimeRange(appointment);
  //     const returnTime = this.getReturnTimeRange(appointment);
  //     // is date in travel block
  //     if((travelTime && date >= travelTime.start && date < travelTime.end)
  //      ||(returnTime && date >= returnTime.start && date < returnTime.end))
  //       return true;
  //   };
  //   return false;
  // }

  
  

  /**
  * Get Appointment "Returning To Site" Time Range
  */
  private getReturnTimeRange(appointment:Appointment) {
    let start = new Date(appointment.endDateTime);
    let end = new Date(start);
    start.setTime(start.getTime() + 1);
    let returnMinutes = end.getMinutes() + parseFloat(appointment.returnHours) * 60
    if(returnMinutes <= 0)
      return null;
    end.setMinutes(returnMinutes);
    return {start, end};
  }

  /**
  * Checks if technician is assigned to the appointment.
  */
  private isTechAssignedToAppointment(technician:number, appointment:Appointment) {
    return appointment.technicians.find((value) => {
      return value == technician;
    });
  }

  unserializeDates(appointment: Appointment) {
    if(appointment.startDateTime && appointment.endDateTime){
      let start = new Date(appointment.startDateTime);
      let end = new Date(appointment.endDateTime);
      appointment.startDate = start;
      appointment.endDate = end;
    }
  }

  serializeDates(appointment: Appointment) {  
    let start = formatDate(<Date>appointment.startDate, environment.dateTimeFormat, "en-US");
    let end = formatDate(<Date>appointment.endDate, environment.dateTimeFormat, "en-US");
    appointment.startDateTime = start;
    appointment.endDateTime = end;
  }

}