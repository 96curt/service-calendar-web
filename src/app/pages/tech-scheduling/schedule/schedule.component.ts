import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { createCustomElement, NgElement, WithProperties } from '@angular/elements';
import { DxButtonComponent, DxSchedulerComponent } from 'devextreme-angular';
import { LoadOptions } from 'devextreme/data';
import CustomStore from 'devextreme/data/custom_store';
import DataSource from 'devextreme/data/data_source';
import {
  Schedule,
  ServiceService,
  Technician,
  ServiceSchedulesListRequestParams,
  ServiceTechsListRequestParams,
  Region,
  OrderAddendum,
  ServiceCentersListRequestParams,
  ServiceOrderAddendumsListRequestParams,
  TypeEnum,
} from 'openapi';
import { lastValueFrom, Observable } from 'rxjs';
import Form, { SimpleItem } from "devextreme/ui/form";
import { FilterComponent } from 'app/shared/components/filter/filter.component';
import { Filter } from 'app/shared/models/filter.model';
import { AppointmentFormOpeningEvent, AppointmentAddingEvent, AppointmentUpdatingEvent, Appointment as dxSchedulerAppointment, AppointmentRenderedEvent, ContentReadyEvent, AppointmentDraggingRemoveEvent, AppointmentClickEvent } from 'devextreme/ui/scheduler';
import notify from 'devextreme/ui/notify';
import { AppointmentType, AppointmentTypeService } from 'app/shared/services/appointmentType.service';
import { formatDate } from '@angular/common';

type Appointment = Schedule & dxSchedulerAppointment & {parentId?:number};
type ToolTipData = {technicians?:Technician[],startDate?:Date,endDate?:Date};

const dateFormat = 'YYYY-MM-ddTHH:mm';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @ViewChild(DxSchedulerComponent, { static: false }) dxScheduler!: DxSchedulerComponent
  @Input() scheduleResource:CustomStore = new CustomStore;
  @Input() technicianResource = {};
  @Input() centerResource = {};
  @Input() addendumResource = {};
  @Input() filterVisible = false;
  @Output() filterVisibleChange = new EventEmitter<boolean>;
  
  currentView = 'Vertical Week'
  appointmentTypeData = this.appointmentTypeService.getAppointmentTypes();
  startDayHour = 5;
  endDayHour = 19;
  tooltipData = {} as ToolTipData;
  constructor(
    private serviceService: ServiceService,
    private appointmentTypeService: AppointmentTypeService
  ) {

  }
  ngOnInit(): void {
    
  }

  /*****  EVENTS ******/
 
  /*
  * DxScheduler OnAppointmentAdding Event Handler. 
  * 
  */
  onAppointmentAdding(e: AppointmentAddingEvent) {
    const isValidAppointment = this.isValidAppointment(e.appointmentData as Appointment);
    if (!isValidAppointment) {
      e.cancel = true;
    }
  }

  /**
   * DxScheduler OnAppointmentClick Event Handler.
   */
  onAppointmentClick(e:AppointmentClickEvent){
    const appointment = e.appointmentData as Appointment;
    this.techniciansLookup(appointment.technicians).then((value) => {
      this.tooltipData.technicians = value;
    });
    this.tooltipData.startDate = new Date(appointment.startDateTime);
    this.tooltipData.endDate = new Date(appointment.endDateTime);
  }

  /**
   * DxScheduler OnContentReady Event Handler. 
   * Using to add custom elements to the scheduler component.
   */
  onContentReady(e: ContentReadyEvent) {
    
    if(document.querySelector(".dx-scheduler-header.dx-widget .dx-toolbar-before #filter-button") != null)
      return;
    let toolbarContentElement = document.querySelector(".dx-scheduler-header.dx-widget .dx-toolbar-before .dx-buttongroup-wrapper");
    // Create Today Button
    let todayBtn = document.createElement("dx-button") as NgElement & WithProperties<DxButtonComponent>;
    todayBtn.text = 'Today';
    todayBtn.setAttribute('id','today-button');
    todayBtn.setAttribute('class','dx-widget dx-button dx-button-mode-text dx-button-normal dx-button-has-text dx-item dx-buttongroup-item dx-item-content dx-buttongroup-item-content dx-shape-standard');
    todayBtn.addEventListener('onClick', (e:any) => {
      this.dxScheduler.currentDate = new Date();
    });
    toolbarContentElement?.appendChild(todayBtn);
    // Create Filter Button
    let filterBtn = document.createElement("dx-button") as NgElement & WithProperties<DxButtonComponent>;
    filterBtn.text = 'Filter';
    filterBtn.setAttribute('id','filter-button');
    filterBtn.setAttribute('class','dx-widget dx-button dx-button-mode-text dx-button-normal dx-button-has-text dx-item dx-buttongroup-item dx-item-content dx-buttongroup-item-content dx-shape-standard');
    filterBtn.addEventListener('onClick', (e:any) => {
      this.displayFilter();
    });
    toolbarContentElement?.appendChild(filterBtn);
  }

  /*
  * DxScheduler OnAppointmentFormOpening Event. 
  * 
  */
  onAppointmentFormOpening(e:AppointmentFormOpeningEvent) {
    let appointment = e.appointmentData as Appointment;
    const tech = appointment.technicians[0];
    const startDate = new Date(appointment.startDateTime);
    if(this.isTravelTime(tech, startDate)) {
      e.cancel = true;
    }
    e.popup.option('showTitle', true);
    e.popup.option('title', appointment.label ? 
        appointment.label : 
        'Create a new appointment');
    const form = e.form;
    let mainGroupItems = form.itemOption('mainGroup').items as Array<any>;
    // Hide label and description items
    {
      let index = mainGroupItems.findIndex(function(i:any) { return i.dataField === "label" })
      if (index != -1) {
        mainGroupItems[index].visible = false;
      }
    }
    {
      let index = mainGroupItems.findIndex(function(i:any) { return i.dataField === "description" })
      if (index != -1) {
        mainGroupItems[index].visible=false;
      }
    }
    // Set Required fields
    mainGroupItems.forEach((item, index) => {
      if(item.dataField === "technicians" || item.dataField === "serviceCenter"){
        item.isRequired = true;
      }
    });
    // Add Travel Hours Item
    if (!mainGroupItems.find(function(i:any) { return i.dataField === "travelHours" })) {
        mainGroupItems.push({
          colSpan: 1, 
          label: { text: "Travel Hours" },
          editorType: "dxTextBox",
          dataField: "travelHours",
          isRequired: true
        } as SimpleItem);
        form.itemOption('mainGroup', 'items', mainGroupItems);
    }
    // Add Return Travel Hours Item
    if (!mainGroupItems.find(function(i:any) { return i.dataField === "returnHours" })) {
      mainGroupItems.push({
        colSpan: 2, 
        label: { text: "Return Hours" },
        editorType: "dxTextBox",
        dataField: "returnHours",
        default: 0.0,
        isRequired: true
      } as SimpleItem);
      form.itemOption('mainGroup', 'items', mainGroupItems);
  }
    // Add Confirm Appointment Item
    if (!mainGroupItems.find(function(i:any) { return i.dataField === "confirmed" })) {
      mainGroupItems.push({
        colSpan: 1, 
        label: { text: "Confirm Appointment" },
        editorType: "dxCheckBox",
        dataField: "confirmed",
      });
      form.itemOption('mainGroup', 'items', mainGroupItems);
    }
  }

  /*
  * DxScheduler OnAppointmentRendered Event. 
  * https://supportcenter.devexpress.com/ticket/details/t1126054/scheduler-how-to-set-the-appointments-width-to-100
  */
  onAppointmentRendered(e:AppointmentRenderedEvent) {
    const width = e.element.querySelector('.dx-scheduler-date-table-cell')!.clientWidth; // get a cell's width
    e.appointmentElement.style.width = `${width}px`;   
  }
  
  /*
  * DxScheduler OnAppointmentUpdating Event. 
  * 
  */
  onAppointmentUpdating(e:AppointmentUpdatingEvent) {
    const isValidAppointment = this.isValidAppointment(e.newData);
    if (!isValidAppointment) {
      e.cancel = true;
    }
  }


  /**
   * Reload data sources and refresh scheduler
   */
  reload(){
    this.dxScheduler.instance.beginUpdate();
    this.dxScheduler.groups = [];
    // this.dxScheduler.resources.forEach((resource:{dataSource:DataSource}) => {
    //   resource.dataSource.reload();
    // });
    for(let resource of this.dxScheduler.resources){
      if(resource.fieldExpr == "technicians"){
        resource.dataSource.reload();
      }
    }
    this.dxScheduler.instance.getDataSource().reload();
    this.dxScheduler.instance.endUpdate();
    this.dxScheduler.groups = ['technicians'];
  }

  /*
  * Unhide the Filter
  */
  displayFilter() {
    this.filterVisibleChange.emit(true);
  }

  /**
  * Checks if technician is traveling at this time.
  */
  isTravelTime(technician: number, date: Date) {
    const schedule = this.dxScheduler.instance.getDataSource().items() as Appointment[];
    for(let appointment of schedule) {
      if(!this.isTechAssignedToAppointment(technician, appointment))
        continue;
      // get appointment travel time
      const travel = this.getTravelTimeRange(appointment);
      // is date in travel block
      if(date >= travel.start && date < travel.end)
        return true;
    };
    return false;
  }

  /**
  * Checks if technician is assigned to the appointment.
  */
  isTechAssignedToAppointment(technician:number, appointment:Appointment) {
    return appointment.technicians.find((value) => {
      return value == technician;
    });
  }

  /**
  * Get Appointment Travel Time Range
  */
  getTravelTimeRange(appointment:Appointment) {
    let end = new Date(appointment.startDateTime);
    let start = new Date(end);
    end.setMinutes(end.getMinutes() - 1);
    start.setMinutes(start.getMinutes() - parseFloat(appointment.travelHours) * 60);
    return {start, end};
  }

  /**
   * Checks if appointment is valid
   */
  isValidAppointment(appointment: Appointment) {
    return this.isValidAppointmentInterval(appointment);
  }

  /**
   * Checks if appointment time interval is valid for all technicians.
   * Also Tries to resolve out of bounds and appointment conflicts
   */
  isValidAppointmentInterval(newAppointment: Appointment) {
    const newEnd = new Date(newAppointment.endDateTime);
    const newStart = this.getTravelTimeRange(newAppointment).start;
    newEnd.setTime(newEnd.getTime() - 1);
    const schedule = this.dxScheduler.instance.getDataSource().items() as Appointment[];
    // Check if appointment is out of bounds, if so move appointment
    if(newStart.getHours() < this.startDayHour || newEnd.getHours() >= this.endDayHour) {
      return false;
      // const diff = this.startDayHour * 60 - newStart.getMinutes();
      // newStart.setMinutes(this.startDayHour * 60);
      // newEnd.setMinutes(newEnd.getMinutes() + diff);
    }
    //else if(newEnd.getHours() >= this.endDayHour) {
      //return false;
      // const diff = newEnd.getMinutes() - this.endDayHour;
      // newEnd.setMinutes(this.endDayHour * 60);
      // newStart.setMinutes(newStart.getMinutes() + diff);
    //}
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

  async techniciansLookup(technicians:number[]){
    return await lastValueFrom(this.serviceService.serviceTechsList({idIn:technicians}));
  }
}

