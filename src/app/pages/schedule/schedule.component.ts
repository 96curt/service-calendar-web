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
} from 'openapi';
import { lastValueFrom } from 'rxjs';
import Form, { SimpleItem } from "devextreme/ui/form";
import { FilterComponent } from 'app/shared/components/filter/filter.component';
import { Filter } from 'app/shared/models/filter.model';
import { AppointmentFormOpeningEvent, AppointmentAddingEvent, AppointmentUpdatingEvent, Appointment } from 'devextreme/ui/scheduler';
import notify from 'devextreme/ui/notify';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @ViewChild(DxSchedulerComponent, { static: false }) dxScheduler!: DxSchedulerComponent

  scheduleStore:  CustomStore;
  techData:  DataSource;
  centerData:  DataSource;
  addendumData:  DataSource;
  sequenceDataSource: CustomStore;
  jobSiteDataSource: CustomStore;
  filterValues = new Filter();
  filterVisible = false;
  currentView = 'Vertical Week'

  constructor(
    private serviceService: ServiceService,
    private injector: Injector
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
        return lastValueFrom(this.serviceService.serviceSchedulesList(requestPrams));
      },
      byKey: (key:number) => {
        return lastValueFrom(this.serviceService.serviceScheduleRetrieve({id:key}));
      },
      insert: (schedule:Schedule) => {
        return lastValueFrom(this.serviceService.serviceSchedulesCreate({schedule:schedule}));
      },
      update: (key:number, schedule:Schedule) => {
        return lastValueFrom(this.serviceService.serviceScheduleUpdate({id:key, schedule:schedule}));
      },
      remove: (key:number) => {
        return lastValueFrom(this.serviceService.serviceScheduleDestroy({id:key}));
      },
      onLoaded: (schedules: Schedule[]) => {
        // schedules.forEach((schedule) => {
        //   let travelEnd = new Date(schedule.startDateTime);
        //   let travelStart = new Date(travelEnd);
        //   travelEnd.setHours(travelEnd.getMinutes() - 1);
        //   travelStart.setHours(travelStart.getHours() - parseFloat(schedule.travelHours));
        //   schedules.push({
        //     startDateTime:travelStart.toDateString(),
        //     endDateTime:travelEnd.toDateString(),
        //     label:"travel Time: " + schedule.travelHours
        //   } as Schedule);

        // });

      },
    });

    let techStore = new CustomStore({
      key: 'id',
      loadMode: 'processed',
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
    this.techData = new DataSource({
      store: techStore
    });
    
    let centerStore = new CustomStore({
      key: 'id',
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
    this.centerData = new DataSource({
      store:centerStore
    })

    let addendumStore = new CustomStore({
      key: 'id',
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
    this.addendumData = new DataSource({
      store: addendumStore
    });

    this.sequenceDataSource = new CustomStore({
      key: 'id',
      load: () => {
        return lastValueFrom(this.serviceService.serviceOrdersSequencesList({}))
        .catch(() => { throw 'Error loading Service Addendums' });
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceOrderSequenceRetrieve({id:key}));
      }
    });

    this.jobSiteDataSource = new CustomStore({
      key: 'id',
      load: () => {
        return lastValueFrom(this.serviceService.serviceJobsitesList())
        .catch(() => { throw 'Error loading Service Addendums' });
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceJobsiteRetrieve({id:key}))
      }
    });

    // Convert Component to a custom element.
    const filterElement = createCustomElement(FilterComponent, {injector:this.injector});
    const ButtonElement = createCustomElement(DxButtonComponent, {injector:this.injector});

    // Register the custom element with the browser.
    customElements.define('filter-element', filterElement);
    customElements.define('dx-button', ButtonElement);
  }


  /*****  EVENTS ******/

  ngOnInit(): void {
  }

  // Adding custom elements to the scheduler component.
  onContentReady(e:any){
    if(document.querySelector(".dx-scheduler-header.dx-widget .dx-toolbar-before #filter-button") != null)
      return;

    console.log("Loading Filter Button");
    

    //let toolbarBeforeElement = document.querySelector(".dx-scheduler-header.dx-widget .dx-toolbar-before");
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

  onFilterChange(e:any){
    //update filter
    this.filterValues = e.detail;
    //reload data
    this.reload();
  }

  showAppointmentPopup(e:any) {
    this.dxScheduler.instance.showAppointmentPopup();
  }

  onAppointmentFormOpening(e:AppointmentFormOpeningEvent) {
    if (e.appointmentData == undefined)
      return;
    const tech = e.appointmentData['technicians'];
    const startDate = new Date(e.appointmentData['startDateTime']);
    if(this.isTravelTime(tech, startDate)){
      e.cancel = true;
      this.notifyDisableDate();
    }

    e.popup.option('showTitle', true);
    e.popup.option('title', e.appointmentData['label'] ? 
        e.appointmentData['label'] : 
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

  onAppointmentAdding(e: any) {
    const isValidAppointment = this.isValidAppointment(e.component, e.appointmentData);
    if (!isValidAppointment) {
      e.cancel = true;
      this.notifyDisableDate();
    }
  }

  onAppointmentUpdating(e: any) {
    const isValidAppointment = this.isValidAppointment(e.component, e.newData);
    if (!isValidAppointment) {
      e.cancel = true;
      this.notifyDisableDate();
    }
  }


  /*** Helper Methods ***/

  reload(){
      //this.dxScheduler.instance.beginUpdate();
      this.dxScheduler.groups = [];
      this.dxScheduler.resources.forEach((resource:{dataSource:DataSource}) => {
        resource.dataSource.reload();
        resource.dataSource.items()
      });
      this.dxScheduler.instance.getDataSource().reload();
      //this.dxScheduler.instance.endUpdate();
      //this.dxScheduler.groups = ['technicians'];
  }

  displayFilter() {
    // Unhide the Filter
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

  isWeekend(date: Date) {
    const day = date.getDay();
    return day === 0 || day === 6;
  }

  /**
     * Checks if technician is traveling at this time.
     */
  isTravelTime(technician: Technician, date: Date) {
    const appointments = this.dxScheduler.instance.getDataSource().items() as Schedule[];
    
    for(let appointment of appointments) {
      // Appointment travel time
      const travelEnd = new Date(appointment.startDateTime);
      const travelStart = new Date(travelEnd);
      travelStart.setHours(travelStart.getHours() - parseFloat(appointment.travelHours));
      // is date in travel block
      if(date >= travelStart && date < travelEnd)
        return true;
    };
    return false;
  }
  isDisableDate(date: Date) {
    return this.isHoliday(date) || this.isWeekend(date);
  }

  isDisabledDateCell(date: Date) {
    return this.currentView === 'month'
      ? this.isHoliday(date)
      : this.isDisableDate(date);
  }

  // isDinner(date: Date) {
  //   const hours = date.getHours();
  //   const dinnerTime = this.dataService.getDinnerTime();
  //   return hours >= dinnerTime.from && hours < dinnerTime.to;
  // }

  // hasCoffeeCupIcon(date: Date) {
  //   const hours = date.getHours();
  //   const minutes = date.getMinutes();
  //   const dinnerTime = this.dataService.getDinnerTime();

  //   return hours === dinnerTime.from && minutes === 0;
  // }

  isValidAppointment(component: any, appointmentData: any) {
    const startDate = new Date(appointmentData.startDate);
    const endDate = new Date(appointmentData.endDate);
    const cellDuration = component.option('cellDuration');
    return this.isValidAppointmentInterval(startDate, endDate, cellDuration);
  }

  isValidAppointmentInterval(startDate: Date, endDate: Date, cellDuration: number) {
    const edgeEndDate = new Date(endDate.getTime() - 1);

    // if (!this.isValidAppointmentTime(edgeEndDate)) {
    //   return false;
    // }

    // const durationInMs = cellDuration * 60 * 1000;
    // const date = startDate;
    // while (date <= endDate) {
    //   if (!this.isValidAppointmentTime(date)) {
    //     return false;
    //   }
    //   const newDateTime = date.getTime() + durationInMs - 1;
    //   date.setTime(newDateTime);
    // }

    return true;
  }

  isValidAppointmentTimeInterval(tech:Technician, startDate:Date, endDate:Date) {
    return !this.isTravelTime(tech, startDate) && !this.isTravelTime(tech, endDate);
  }

  // applyDisableDatesToDateEditors(form: any) {
  //   const holidays = this.dataService.getHolidays();
  //   const startDateEditor = form.getEditor('startDate');
  //   startDateEditor.option('disabledDates', holidays);

  //   const endDateEditor = form.getEditor('endDate');
  //   endDateEditor.option('disabledDates', holidays);
  // }

}
