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
  OrderAddendumDetail
} from 'openapi';
import { filter, lastValueFrom } from 'rxjs';
import { Value } from 'sass-embedded';
import Form, { SimpleItem } from "devextreme/ui/form";
import { PatternRule } from 'devextreme/ui/validation_rules';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  @ViewChild(DxSchedulerComponent, { static: false }) dxScheduler!: DxSchedulerComponent

  scheduleDataSource:  CustomStore;
  techDataSource:  CustomStore;
  centerDataSource:  CustomStore;
  addendumDataSource:  CustomStore;
  selectedTechs: number[] | undefined;
  selectedRegion: number | undefined;

  constructor(private serviceService: ServiceService, private customerService:CustomerService) {

    this.techDataSource = new CustomStore({
      key: 'id',
      loadMode:'processed',
      load: () => {
        const requestPrams = {
          primaryCenterRegion:this.selectedRegion
        } as ServiceTechsListRequestParams
        return lastValueFrom(this.serviceService.serviceTechsList(requestPrams))
        .then((response:Technician[]) => {
          let techs: number[] | undefined = [];
          response.forEach((tech) => {
            techs!.push(tech.id)
          });
          this.selectedTechs = techs;
          return {
            data:response
          }
        })
        .catch(() => { throw 'Error loading technicians' });
      }
    });

    this.scheduleDataSource = new CustomStore({
      key: 'id',
      loadMode:'processed',
      load: (loadOptions) => {
        let filter = loadOptions.filter[0]
        let requestPrams = {
          startDateTimeBefore: filter[0][1][2],
          endDateTimeAfter: filter[0][0][2],
          technicians:this.selectedTechs
        } as ServiceSchedulesListRequestParams
        
        return lastValueFrom(this.serviceService.serviceSchedulesList(requestPrams))
        .then(response => {
          return {
            data:response,
          }
        })
        .catch(() => { throw 'Error Loading Appointments' });
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

    this.centerDataSource = new CustomStore({
      key: 'id',
      load: () => {
        return lastValueFrom(this.serviceService.serviceCentersList())
        .then(response => {
          return {
            data:response
          }
        })
        .catch(() => { throw 'Error loading Service Centers' });
      }
    });

    this.addendumDataSource = new CustomStore({
      key: 'id',
      load: (loadOptions) => {
        return lastValueFrom(this.serviceService.serviceOrderAddendumsList({}))
        .then(response => {
          return {
            data:response
          }
        })
        .catch(() => { throw 'Error loading Service Addendums' });
      }
    });
  }


  /*****  EVENTS ******/


  ngOnInit(): void {
  }

  onSelectedRegion(region:number) {
    this.dxScheduler.instance.beginUpdate();
    this.selectedRegion = region;
    this.techDataSource.load();
    this.scheduleDataSource.load();
    this.dxScheduler.instance.endUpdate();
  }

  onAppointmentFormOpening(e:any) {
    e.popup.option('showTitle', true);
    e.popup.option('title', e.appointmentData.text ? 
        e.appointmentData.text : 
        'Create a new appointment');

    const form = e.form as Form;
    let mainGroupItems = form.itemOption('mainGroup').items as Array<any>;
    {
      let index = mainGroupItems.findIndex(function(i:any) { return i.dataField === "description" })
      if (index != -1) {
        mainGroupItems.splice(index, 1);
      }
    }

    //editing form items for resources
    mainGroupItems.forEach((item, index) => {
      if(item.dataField === "technicians" || item.dataField === "serviceCenter" || item.dataField === "description"){
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

  // getAddendum(id:): OrderAddendum {
  //   return this.addendumDataSource.byKey(id);
  // }
  
  // getSequence(id){

  // }

  getCustomer(schedule:Schedule){
    let addendum: OrderAddendumDetail
    addendum await this.addendumDataSource.byKey(schedule.addendum).then(
      (response) =>  {
        return response;
      }
    );
    
    this.customerService.customerRetrieve({addendum.})
  }
    
    
    
  //   await this.techDataSource.byKey(techId).then((response) => {
  //       return response.name;
  //     });
    
    
    
  //   return names;
  // }
}
