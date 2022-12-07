import { Component, OnInit, ViewChild } from '@angular/core';
import { CollectionNestedOptionContainerImpl, DxSchedulerComponent } from 'devextreme-angular';
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
  CustomerService,
  OrderAddendum,
} from 'openapi';
import { filter, lastValueFrom } from 'rxjs';
import { Value } from 'sass-embedded';
import Form, { SimpleItem } from "devextreme/ui/form";
import { PatternRule } from 'devextreme/ui/validation_rules';
import Calendar from 'devextreme/ui/calendar'

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @ViewChild(DxSchedulerComponent, { static: false }) dxScheduler!: DxSchedulerComponent

  scheduleStore:  CustomStore;
  techStore:  CustomStore;
  centerStore:  CustomStore;
  addendumStore:  CustomStore;
  sequenceDataSource: CustomStore;
  jobSiteDataSource: CustomStore;

  filterAdded = false

  selectedTechs: number[] | undefined;
  selectedRegion: number | undefined;

  constructor(private serviceService: ServiceService, private customerService:CustomerService) {

    this.techStore = new CustomStore({
      key: 'id',
      loadMode:'processed',
      load: () => {
        const requestPrams = {
        } as ServiceTechsListRequestParams
        return lastValueFrom(this.serviceService.serviceTechsList(requestPrams))
        .catch(() => { throw 'Error loading technicians' });
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceTechRetrieve({id:key}));
      }
    });

    this.scheduleStore = new CustomStore({
      key: 'id',
      loadMode:'processed',
      load: (loadOptions) => {
        let filter = loadOptions.filter[0]
        let requestPrams = {
          startDateTimeBefore: filter[0][1][2],
          endDateTimeAfter: filter[0][0][2],
        } as ServiceSchedulesListRequestParams
        
        return lastValueFrom(this.serviceService.serviceSchedulesList(requestPrams))
        .catch(() => { throw 'Error Loading Appointments' });
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceScheduleRetrieve({id:key}));
      },
      insert: (schedule:Schedule) => {
        return lastValueFrom(this.serviceService.serviceSchedulesCreate({schedule:schedule}))
        .catch(() => { throw 'Error Creating Appointment: ' + schedule.description });
      },
      update: (key:number, schedule:Schedule) => {
        return lastValueFrom(this.serviceService.serviceScheduleUpdate({id:key, schedule:schedule}))
        .catch(() => { throw 'Error Updating Appointment: ' + key });
      },
      remove: (key:number) => {
        return lastValueFrom(this.serviceService.serviceScheduleDestroy({id:key}))
        .catch(() => { throw 'Error Removing Appointment: ' + key})
      }
    });

    this.centerStore = new CustomStore({
      key: 'id',
      load: () => {
        return lastValueFrom(this.serviceService.serviceCentersList())
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceCenterRetrieve({id:key}));
      }
    });

    this.addendumStore = new CustomStore({
      key: 'id',
      load: () => {
        return lastValueFrom(this.serviceService.serviceOrderAddendumsList({}))
        .catch(() => { throw 'Error loading Service Addendums' });
      },
      byKey: (key) => {
        return lastValueFrom(this.serviceService.serviceOrderAddendumRetrieve({id:key}))
      }
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
  }


  /*****  EVENTS ******/


  ngOnInit(): void {
  }

  onContentReady(e:any){
    if (this.filterAdded)  
        return;  
  
    let element = document.querySelectorAll(".dx-scheduler-navigator");  
    const container = document.createElement("div");  
    var comp = document.createElement("app-filter");

    comp.addEventListener("onChanged",  event => {  
      console.log("filter changed")
    });
    container.appendChild(comp)
    element[0].appendChild(container); 

    this.filterAdded = true;  
  }

  onFilterChange(region:number) {
    this.dxScheduler.instance.beginUpdate();
    let scheduleSource = this.dxScheduler.instance.getDataSource();
    let options = scheduleSource.loadOptions()
    console.log(options.filter);
    
    this.dxScheduler.resources.forEach(({dataSource,fieldExpr})=>{
      dataSource.load();
    })

    this.selectedRegion = region;
    
    
    this.techStore.load();
    this.scheduleStore.load();
    scheduleSource.load();
    this.dxScheduler.instance.endUpdate();
  }

  onAppointmentFormOpening(e:any) {
    e.popup.option('showTitle', true);
    e.popup.option('title', e.appointmentData.label ? 
        e.appointmentData.label : 
        'Create a new appointment');

    const form = e.form as Form;
    let mainGroupItems = form.itemOption('mainGroup').items as Array<any>;
    {
      let index = mainGroupItems.findIndex(function(i:any) { return i.dataField === "label" })
      if (index != -1) {
        mainGroupItems[index].visible=false;
        
      }
    }
    {
      let index = mainGroupItems.findIndex(function(i:any) { return i.dataField === "description" })
      if (index != -1) {
        mainGroupItems[index].visible=false;
        
      }
    }

    //editing form items for resources
    mainGroupItems.forEach((item, index) => {
      if(item.dataField === "technicians" || item.dataField === "serviceCenter"){
        item.isRequired = true;
      }
    });


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

  async getAddendum(id:number) {
    let tmp = await this.addendumStore.byKey(id);
    console.log(tmp)
    return tmp
  }
  
  getSequence(id:number){

  }

  getCustomer(id:number){
    
    

  }
       
 
}
