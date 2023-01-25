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
import { AppointmentFormOpeningEvent, AppointmentAddingEvent, AppointmentUpdatingEvent, Appointment as dxSchedulerAppointment, AppointmentRenderedEvent, ContentReadyEvent, AppointmentDraggingRemoveEvent, AppointmentClickEvent, AppointmentDblClickEvent } from 'devextreme/ui/scheduler';
import notify from 'devextreme/ui/notify';
import { AppointmentType, AppointmentTypeService } from 'app/shared/services/appointmentType.service';
import { AppointmentService, Appointment, EditAppointment} from 'app/shared/services/appointment.service';
import { formatDate } from '@angular/common';
import { flush } from '@angular/core/testing';


type ToolTipData = {technicians?:Technician[],startDate?:Date,endDate?:Date};


@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent {
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
  appointmentData: Appointment | null = null;
  customAppointmentFormVisible = false;
  constructor(
    private serviceService: ServiceService,
    private appointmentTypeService: AppointmentTypeService,
    private appointmentService: AppointmentService
  ) {
  }

  /*
  * DxScheduler OnAppointmentAdding Event Handler. 
  * 
  */
  onAppointmentAdding(e: AppointmentAddingEvent) {
    const isValidAppointment = this.appointmentService.isValidAppointment(e.appointmentData as Appointment,this.dxScheduler);
    if (!isValidAppointment) {
      e.cancel = true;
    }
  }

  /**
   * DxScheduler OnAppointmentClick Event Handler.
   * Show ToolTip
   */
  onAppointmentClick(e:AppointmentClickEvent){
    const appointment = e.appointmentData as Appointment;
    if(appointment.type=="TRVL"){
      e.cancel=true;
      return;
    }
    this.techniciansLookup(appointment.technicians).then((value) => {
      this.tooltipData.technicians = value;
    });
    this.tooltipData.startDate = new Date(appointment.startDateTime);
    this.tooltipData.endDate = new Date(appointment.endDateTime);
  }

  /**
   * DxScheduler OnAppointmentClick Event Handler.
   * Show Appointment Details Form
   */
  onAppointmentDblClick(e:AppointmentDblClickEvent){

  }

  /**
   * DxScheduler OnContentReady Event Handler. 
   * Using to add custom elements to the scheduler component.
   */
  onContentReady(e: ContentReadyEvent) {
    let todayBtn = document.getElementById('today-button');
    let toolbarContentElement = document.querySelector(".dx-scheduler-header.dx-widget .dx-toolbar-before .dx-buttongroup-wrapper");
    if(todayBtn && toolbarContentElement) {  
      toolbarContentElement.appendChild(todayBtn);
    }
    let filterBtn = document.getElementById('filter-button');
    if(filterBtn && toolbarContentElement) {  
      toolbarContentElement.appendChild(filterBtn);
    }
  }

  /*
  * DxScheduler OnAppointmentFormOpening Event Handler. 
  * 
  */
  onAppointmentFormOpening(e:AppointmentFormOpeningEvent) {
    e.cancel=true; // disable default form
    let appointment = e.appointmentData as Appointment;
    if(appointment.type=="TRVL")
      return;
    this.appointmentData = appointment;
    this.customAppointmentFormVisible = true; // display custom form
    return;

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
  * DxScheduler OnAppointmentRendered Event Handler. 
  * https://supportcenter.devexpress.com/ticket/details/t1126054/scheduler-how-to-set-the-appointments-width-to-100
  */
  onAppointmentRendered(e:AppointmentRenderedEvent) {
    const appointment = e.appointmentData as Appointment;
    const width = e.element.querySelector('.dx-scheduler-date-table-cell')!.clientWidth; // get a cell's width
    e.appointmentElement.style.width = `${width}px`;
    e.appointmentElement.classList.replace('dx-state-disabled','dx-state-travel');
    if(appointment.confirmed)
      e.appointmentElement.classList.add("dx-state-confirmed");
    if(appointment.type=="MISC")
      e.appointmentElement.classList.add("dx-state-misc");


  }
  
  /*
  * DxScheduler OnAppointmentUpdating Event Handler. 
  * 
  */
  onAppointmentUpdating(e:AppointmentUpdatingEvent) {
    const isValidAppointment = this.appointmentService.isValidAppointment(e.newData,this.dxScheduler);
    if (!isValidAppointment) {
      e.cancel = true;
    }
  }

  /**
   * Today DxButton OnClick Event Handler.
   */
  onTodayClick(e:any){
    this.dxScheduler.currentDate = new Date();
  }

  /**
   * Remove Appointment dxButton Event Handler
   */
  onDeleteClick(e:any,appointment:Appointment){
    this.dxScheduler.instance.deleteAppointment(appointment);
  }

  /**
   * Remove Appointment dxButton Event Handler
   */
  onEditClick(e:any,appointment:Appointment){
    this.dxScheduler.instance.showAppointmentPopup(appointment);
  }

  /**
   * Reload data sources and refresh scheduler
   */
  reload(){
    this.dxScheduler.instance.beginUpdate();
    this.dxScheduler.groups = [];
    for(let resource of this.dxScheduler.resources){
      if(resource.fieldExpr == "technicians"
      || resource.fieldExpr == "serviceCenter"
      || resource.fieldExpr == "addendum"){
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

  async techniciansLookup(technicians:number[]){
    return await lastValueFrom(this.serviceService.serviceTechsList({idIn:technicians}));
  }

  showAppointmentPopup(){
    this.dxScheduler.instance.showAppointmentPopup();
  }
}

