import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppointmentService, Appointment } from 'app/shared/services/appointment.service';
import { ServiceService, Technician } from 'openapi';
import { lastValueFrom } from 'rxjs';

type ToolTipData = {technicians?:Technician[], startDate?:Date, endDate?:Date};

@Component({
  selector: 'app-scheduler-tooltip',
  templateUrl: './scheduler-tooltip.component.html',
  styleUrls: ['./scheduler-tooltip.component.scss']
})
export class SchedulerTooltipComponent implements OnInit {
  @Input() appointmentData: any = {};
  @Output() onDeleteClick = new EventEmitter<Appointment>();
  @Output() onEditClick = new EventEmitter<Appointment>();
  tooltipData: ToolTipData = {};
  constructor(
    private appointmentService: AppointmentService,
    private serviceService: ServiceService) { }

  ngOnInit(): void {
  }

  onVisible() {
    this.techniciansLookup(this.appointmentData.technicians).then((value) => {
      this.tooltipData.technicians = value;
    });
    this.tooltipData.startDate = new Date(this.appointmentData.startDateTime);
    this.tooltipData.endDate = new Date(this.appointmentData.endDateTime);
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
  _onEditClick(e:any,appointment:Appointment){
    this.onEditClick
  }

  async techniciansLookup(technicians:number[]) {
    return await lastValueFrom(this.serviceService.serviceTechsList({idIn:technicians}));
  }
}
