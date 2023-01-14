import { Component, EventEmitter, Injector, OnInit, ViewChild } from '@angular/core';
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
import { AppointmentFormOpeningEvent, AppointmentAddingEvent, AppointmentUpdatingEvent, Appointment as dxSchedulerAppointment, AppointmentRenderedEvent, ContentReadyEvent } from 'devextreme/ui/scheduler';
import notify from 'devextreme/ui/notify';
import { AppointmentType, AppointmentTypeService } from './appointmentType.service';
import { formatDate } from '@angular/common';

type Appointment = Schedule & dxSchedulerAppointment & {parentId?:number};

const dateFormat = 'YYYY-MM-ddTHH:mm';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @ViewChild(DxSchedulerComponent, { static: false }) dxScheduler!: DxSchedulerComponent

  scheduleStore:  CustomStore;
  techDataSource:  DataSource;
  centerDataSource:  DataSource;
  addendumDataSource:  DataSource;
  filterValues = new Filter();
  filterVisible = false;
  currentView = 'Vertical Week'
  appointmentTypeDataSource: DataSource<any, any>;
  startDayHour = 5;
  endDayHour = 19;

  constructor(
    private serviceService: ServiceService,
    private appointmentTypeService: AppointmentTypeService
  ) {
    this.scheduleStore = new CustomStore({
      key: 'id',
      loadMode:'processed',
      load: (loadOptions:LoadOptions) => {
        let requestPrams = {
          startDateTimeBefore: loadOptions.filter[0][1][2],
          endDateTimeAfter: loadOptions.filter[0][0][2],
          serviceCenterRegionIdIn:this.filterValues.regions,
          serviceCenterRegionManagersIdIn:this.filterValues.managers,
          serviceCenterIdIn:this.filterValues.centers,
          serviceCenterRegionCitiesIdIn:this.filterValues.cities,
          serviceCenterRegionZipCodesCodeIn:this.filterValues.zipCodes
        } as ServiceSchedulesListRequestParams
        return lastValueFrom(this.serviceService.serviceSchedulesList(requestPrams,'body')) as  Promise<Array<Appointment>>;
      },
      byKey: (key:number) => {
        return lastValueFrom(this.serviceService.serviceScheduleRetrieve({id:key})) as  Promise<Appointment>;
      },
      insert: (appointment:Appointment) => {
        return lastValueFrom(this.serviceService.serviceSchedulesCreate({schedule:appointment})) as Promise<Appointment>;
      },
      update: (key:number, appointment:Appointment) => {
        return lastValueFrom(this.serviceService.serviceScheduleUpdate({id:key, schedule:appointment})) as Promise<Appointment>;
      },
      remove: (key:number) => {
        return lastValueFrom(this.serviceService.serviceScheduleDestroy({id:key}));
      },
      onLoaded: (schedule:Array<Appointment>) => {
        const length = schedule.length;
        //Create travel time blocks
        for(let i = 0; i < length; i++) {
          const appointment = schedule[i];
          const travel = this.getTravelTimeRange(appointment);
          schedule.push({
            id: schedule.at(-1)!.id + 1,
            parentId:appointment.id,
            technicians: appointment.technicians,
            startDateTime: formatDate(travel.start, dateFormat, 'en-US'),
            endDateTime: formatDate(travel.end, dateFormat, 'en-US'),
            label: "travel Time: " + appointment.travelHours,
            type: TypeEnum.Trvl,
            disabled: true,
            travelHours: '',
            serviceCenter: 0,
            addendumLaborHours: '',
            addendumName: '',
            billingCustName: '',
            JobsiteAddress: ''
          });
        }
      },
      errorHandler: (error:any) => {
        notify(error.message, 'error', 5000)
      }
    });
    this.techDataSource = new DataSource({
      key: 'id',
      loadMode:'processed',
      load: () => {
        const prams = {
          centersRegionIdIn:this.filterValues.regions,
          centersRegionManagersIdIn:this.filterValues.managers,
          centersIdIn:this.filterValues.centers,
          centersRegionCitiesIdIn:this.filterValues.cities,
          centersRegionZipCodesCodeIn:this.filterValues.zipCodes,
          idIn:this.filterValues.techs
        } as ServiceTechsListRequestParams;
        return lastValueFrom(this.serviceService.serviceTechsList(prams));
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceTechRetrieve({id:key}));
      }
    });
    this.centerDataSource = new DataSource({
      key: 'id',
      loadMode:'processed',
      load: () => {
        const params = {
          regionIdIn:this.filterValues.regions,
          regionManagersIdIn:this.filterValues.managers,
        } as ServiceCentersListRequestParams
        return lastValueFrom(this.serviceService.serviceCentersList(params))
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceCenterRetrieve({id:key}));
      }
    });
    this.addendumDataSource = new DataSource({
      key: 'id',
      loadMode:'processed',
      load: () => {
        const params = {
          sequenceJobSiteRegionIdIn:this.filterValues.regions,
          sequenceManagerIdIn:this.filterValues.managers,
          sequenceJobSiteRegionCentersIdIn:this.filterValues.centers,
          sequenceJobSiteRegionCitiesIdIn:this.filterValues.cities,
          sequenceJobSiteRegionZipCodesCodeIn:this.filterValues.zipCodes,
          sequenceJobSiteRegionCentersTechniciansIdIn:this.filterValues.techs
        } as ServiceOrderAddendumsListRequestParams
        return lastValueFrom(this.serviceService.serviceOrderAddendumsList(params))
        .catch(() => { throw 'Error loading Service Addendums' });
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceOrderAddendumRetrieve({id:key}))
      }
    });
    this.appointmentTypeDataSource = new DataSource({
      load: () => this.appointmentTypeService.getAppointmentTypes()
    })
  }

  /*****  EVENTS ******/

  ngOnInit(): void {
  }

  /*
  * Filter Component OnChange Event Handler
  */
  onFilterChange(e:any){
    //update filter
    this.filterValues = e.detail;
    //reload data
    this.reload();
  }

  /*
  * dx-speed-dial-action onClick Event Handler.
  */
  showAppointmentPopup(e:any) {
    this.dxScheduler.instance.showAppointmentPopup();
  }

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

  /*
  * DxScheduler OnContentReady Event Handler. 
  * Using to add custom elements to the scheduler component.
  */
  onContentReady(e: ContentReadyEvent){
    if(document.querySelector(".dx-scheduler-header.dx-widget .dx-toolbar-before #filter-button") != null)
      return;
    let toolbarContentElement = document.querySelector(".dx-scheduler-header.dx-widget .dx-toolbar-before .dx-buttongroup-wrapper");
    // Create Filter Button
    let filterBtn = document.createElement("dx-button") as NgElement & WithProperties<DxButtonComponent>;
    filterBtn.text = 'Filter';
    filterBtn.setAttribute('id','filter-button');
    filterBtn.setAttribute('class','dx-widget dx-button dx-button-mode-text dx-button-normal dx-button-has-text dx-item dx-buttongroup-item dx-item-content dx-buttongroup-item-content dx-shape-standard');
    filterBtn.addEventListener('onClick', (e:any) => {
      this.displayFilter();
    });
    // Create Today Button
    let todayBtn = document.createElement("dx-button") as NgElement & WithProperties<DxButtonComponent>;
    todayBtn.text = 'Today';
    todayBtn.setAttribute('id','today-button');
    todayBtn.setAttribute('class','dx-widget dx-button dx-button-mode-text dx-button-normal dx-button-has-text dx-item dx-buttongroup-item dx-item-content dx-buttongroup-item-content dx-shape-standard');
    todayBtn.addEventListener('onClick', (e:any) => {
      this.dxScheduler.currentDate = new Date();
    });
    toolbarContentElement?.appendChild(todayBtn);
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
          colSpan: 2, 
          label: { text: "Travel Hours" },
          editorType: "dxTextBox",
          dataField: "travelHours",
          isRequired: true
        } as SimpleItem);
        form.itemOption('mainGroup', 'items', mainGroupItems);
    }
    // Add Confirm Appointment Item
    if (!mainGroupItems.find(function(i:any) { return i.dataField === "confirm" })) {
      mainGroupItems.push({
        colSpan: 1, 
        label: { text: "Confirm Appointment" },
        editorType: "dxCheckBox",
        dataField: "confirm",
      });
      form.itemOption('mainGroup', 'items', mainGroupItems);
    }
  }

  /*
  * DxScheduler OnAppointmentRendered Event. 
  * https://supportcenter.devexpress.com/ticket/details/t1126054/scheduler-how-to-set-the-appointments-width-to-100
  */
  onAppointmentRendered(e:any) {
    const width = e.element.querySelector('.dx-scheduler-date-table-cell').clientWidth; // get a cell's width
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

  /*** Helper Methods ***/

  /*
  * Reload DataSources and refresh scheduler
  */
  reload(){
    this.dxScheduler.instance.beginUpdate();
    this.dxScheduler.groups = [];
    this.dxScheduler.resources.forEach((resource:{dataSource:DataSource}) => {
      resource.dataSource.reload();
    });
    this.dxScheduler.instance.getDataSource().reload();
    this.dxScheduler.instance.endUpdate();
    this.dxScheduler.groups = ['technicians'];
  }

  /*
  * Unhide the Filter
  */
  displayFilter() {
    this.filterVisible = true;
  }

  notifyDisableDate() {
    notify('Cannot create or move an appointment/event to disabled time/date regions.', 'warning', 1000);
  }

  isHoliday(date: Date) {
    //const localeDate = date.toLocaleDateString();
    //const holidays = this.dataService.getHolidays();
    //return holidays.filter((holiday) => holiday.toLocaleDateString() === localeDate).length > 0;
    return false;
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

  isDisableDate(date: Date) {
    return this.isHoliday(date) // || this.isWeekend(date);
  }

  isDisabledDateCell(date: Date) {
    return this.currentView === 'month'
      ? this.isHoliday(date)
      : this.isDisableDate(date);
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
    if(newStart.getHours() < this.startDayHour) {
      const diff = this.startDayHour * 60 - newStart.getMinutes();
      newStart.setMinutes(this.startDayHour * 60);
      newEnd.setMinutes(newEnd.getMinutes() + diff);
      return false;
    }
    if(newEnd.getHours() >= this.endDayHour) {
      const diff = newEnd.getMinutes() - this.endDayHour;
      newEnd.setMinutes(this.endDayHour * 60);
      newStart.setMinutes(newStart.getMinutes() + diff);
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
          //try to move appointment then validate again?
          return false;
        }
      }
    }
    return true;
  }
  /** 
   * find a valid interval for an appointment with an invalid interval.
   */
  findValidInterval(appointment:Appointment, start:Date, end:Date){
    
  }

  isAppointmentInBounds(){

  }
  /**
   * Does Appointment time interval conflict with other appointments
   * if there is a conflict return the appoinmtent thet conflicts
   */
  doesAppointmentConflict(newAppointment:Appointment,newStart:Date,newEnd:Date){
    const schedule = this.dxScheduler.instance.getDataSource().items() as Appointment[];
    
    return true;
  }
}

