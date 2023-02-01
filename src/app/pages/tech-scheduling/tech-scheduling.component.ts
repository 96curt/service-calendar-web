import { Component, OnInit, ViewChild } from '@angular/core';
import { FilterModel } from 'app/shared/models/filter.model';
import CustomStore from 'devextreme/data/custom_store';
import { Schedule, ServiceCentersListRequestParams, ServiceOrderAddendumsListRequestParams, ServiceSchedulesListRequestParams, ServiceService, ServiceTechsListRequestParams, Technician, TypeEnum } from 'openapi';
import {Appointment as dxSchedulerAppointment} from 'devextreme/ui/scheduler';
import { AppointmentTypeService } from '../../shared/services/appointmentType.service';
import { LoadOptions } from 'devextreme/data';
import { lastValueFrom } from 'rxjs';
import { formatDate } from '@angular/common';
import notify from 'devextreme/ui/notify';
import { ScheduleComponent } from './schedule/schedule.component';
import DataSource from 'devextreme/data/data_source';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { Appointment } from 'app/shared/models/appointment.model';
import { TechSchedulingService } from 'app/shared/services/tech-scheduling.service';

type ToolTipData = { technicians?:Technician[], startDate?:Date, endDate?:Date };

@Component({
  selector: 'app-tech-scheduling',
  templateUrl: './tech-scheduling.component.html',
  styleUrls: ['./tech-scheduling.component.scss']
})
export class TechSchedulingComponent {
  @ViewChild(ScheduleComponent, { static: false }) appCalendar!: ScheduleComponent;
  scheduleStore:  CustomStore;
  technicianStore:  CustomStore;
  centerStore:  CustomStore;
  addendumStore:  CustomStore;
  technicianDataSource: DataSource;
  centerDataSource: DataSource;
  addendumDataSource: DataSource;
  filterValues = new FilterModel();
  filterVisible = false;
  // currentView = 'Vertical Week'
  // appointmentTypeData;
  // startDayHour = 5;
  // endDayHour = 19;
  // tooltipData = {} as ToolTipData;
  // viewTitle = "Calendar"
  views:any;
  constructor(
    private techSchedulingService: TechSchedulingService,
    private appointmentTypeService: AppointmentTypeService,
    private appointmentService: AppointmentService
  ) {
    this.scheduleStore = techSchedulingService.scheduleStore;
    this.technicianStore = techSchedulingService.technicianStore;
    this.centerStore = techSchedulingService.centerStore;
    this.addendumStore = techSchedulingService.addendumStore;
    //this.appointmentTypeData = this.appointmentTypeService.getAppointmentTypes();
    this.technicianDataSource = new DataSource({store:this.technicianStore});
    this.centerDataSource = new DataSource({store:this.centerStore});
    this.addendumDataSource = new DataSource({store:this.addendumStore});
    this.views = techSchedulingService.views;
  }

  /*** Event Handlers ***/

  /*
   * dx-speed-dial-action onClick Event Handler.
   */
   showAppointmentPopup(e:any) {
    this.appCalendar.showAppointmentPopup();
  }


  /*
   * Filter Component OnChange Event Handler
   */
  onFilterChange(e:any){
    //update filter
    this.techSchedulingService.filterValues = e;
    //reload data
    this.appCalendar.reload();
  }

  /*
  * Unhide the Filter
  */
  displayFilter() {
    this.filterVisible = true;
  }

}
