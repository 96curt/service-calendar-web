import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Appointment, AppointmentModel } from 'app/shared/models/appointment.model';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { ServiceService, Technician } from 'openapi';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-scheduler-tooltip',
  templateUrl: './scheduler-tooltip.component.html',
  styleUrls: ['./scheduler-tooltip.component.scss']
})
export class SchedulerTooltipComponent implements OnChanges {
  @Input() selectedAppointment: Appointment | undefined;
  @Output() onDeleteClick = new EventEmitter<Appointment>();
  @Output() onEditClick = new EventEmitter<Appointment>();
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  appointment: AppointmentModel;
  technicians: Technician[];
  startDate: Date;
  endDate: Date;
  constructor (
    private appointmentService: AppointmentService,
    private serviceService: ServiceService
  ) {
    this.appointment = new AppointmentModel();
    this.technicians = [];
    this.startDate = new Date();
    this.endDate = new Date();
    

  }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.visible) {
      if(changes['appointmentData']) {
        this.loadData();
      }
    }
  }

  loadData() {
    if(!this.selectedAppointment)
      return;
    this.appointment = new AppointmentModel(this.selectedAppointment);
    this.techniciansLookup(this.appointment.technicians).then((value) => {
      this.technicians = value;
    });
    this.startDate = new Date(this.appointment.startDateTime);
    this.endDate = new Date(this.appointment.endDateTime);
  }

  /**
   * Remove Appointment dxButton Event Handler
   */
  _onDeleteClick(e:any, appointment:Appointment) {
    this.onDeleteClick.emit(appointment);
  }

  /**
   * Remove Appointment dxButton Event Handler
   */
  _onEditClick(e:any, appointment:Appointment) {
    this.onEditClick.emit(appointment);
  }

  async techniciansLookup(technicians:number[]) {
    return await lastValueFrom(this.serviceService.serviceTechsList({idIn:technicians}));
  }
}
