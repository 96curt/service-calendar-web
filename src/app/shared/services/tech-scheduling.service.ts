import { Injectable } from '@angular/core';
import { LoadOptions } from 'devextreme/data';
import CustomStore from 'devextreme/data/custom_store';
import { OrderAddendum, ServiceCenter, ServiceCentersListRequestParams, ServiceOrderAddendumsListRequestParams, ServiceSchedulesListRequestParams, ServiceService, ServiceTechsListRequestParams, Technician } from 'openapi';
import { lastValueFrom } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import { FilterModel } from '../models/filter.model';
import { AppointmentService } from './appointment.service';

@Injectable({
  providedIn: 'root'
})
export class TechSchedulingService {
  
  filterValues = new FilterModel();
  scheduleStore: CustomStore<Appointment, number>;
  technicianStore: CustomStore<Technician, number>;
  centerStore: CustomStore<ServiceCenter, number>;
  addendumStore: CustomStore<OrderAddendum, number>;
  views: { id: number; title: string; }[];

  constructor(
    private appointmentService: AppointmentService,
    private serviceService: ServiceService
  ) {
    this.scheduleStore = new CustomStore({
      key: 'id',
      loadMode:'processed',
      load: (loadOptions:LoadOptions) => {
        let requestPrams = {
          startDateTimeBefore: (loadOptions.filter? loadOptions.filter[0][1][2]: null),
          endDateTimeAfter: (loadOptions.filter? loadOptions.filter[0][0][2]: null),
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
      insert: (appointment) => {
        this.appointmentService.serializeDates(appointment);
        return lastValueFrom(this.serviceService.serviceSchedulesCreate({schedule:appointment})) as Promise<Appointment>;
      },
      update: (key:number, appointment:Appointment) => {
        this.appointmentService.serializeDates(appointment);
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
          this.appointmentService.unserializeDates(appointment);
          this.appointmentService.createTravelAppointments(appointment,schedule.at(-1)!.id + 1)
          .forEach((appointment)=>{
            schedule.push(appointment);
          });
        }
      }
    });
    this.technicianStore = new CustomStore({
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
    this.centerStore = new CustomStore({
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
    this.addendumStore = new CustomStore({
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
    
    this.views = [
      {id:0,title:"Calendar"},
      {id:1,title:"SpreadSheet"},
      {id:2,title:"Map"}
    ];
  }

  updateFilter(filter: FilterModel) {
    this.filterValues = filter;
  }
}
