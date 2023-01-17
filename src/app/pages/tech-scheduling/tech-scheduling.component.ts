import { Component, OnInit } from '@angular/core';
import { Filter } from 'app/shared/models/filter.model';
import CustomStore from 'devextreme/data/custom_store';
import { Schedule, ServiceCentersListRequestParams, ServiceOrderAddendumsListRequestParams, ServiceSchedulesListRequestParams, ServiceService, ServiceTechsListRequestParams, Technician, TypeEnum } from 'openapi';
import {Appointment as dxSchedulerAppointment} from 'devextreme/ui/scheduler';
import { AppointmentTypeService } from '../../shared/services/appointmentType.service';
import { LoadOptions } from 'devextreme/data';
import { lastValueFrom } from 'rxjs';
import { formatDate } from '@angular/common';
import notify from 'devextreme/ui/notify';

type Appointment = Schedule & dxSchedulerAppointment & { parentId?:number };
type ToolTipData = { technicians?:Technician[], startDate?:Date, endDate?:Date };

@Component({
  selector: 'app-tech-scheduling',
  templateUrl: './tech-scheduling.component.html',
  styleUrls: ['./tech-scheduling.component.scss']
})
export class TechSchedulingComponent {
  scheduleStore:  CustomStore;
  technicianStore:  CustomStore;
  centerStore:  CustomStore;
  addendumStore:  CustomStore;
  filterValues = new Filter();
  filterVisible = false;
  currentView = 'Vertical Week'
  appointmentTypeData;
  startDayHour = 5;
  endDayHour = 19;
  tooltipData = {} as ToolTipData;
  viewTitle = "Calendar"
  constructor(
    private serviceService: ServiceService,
    private appointmentTypeService: AppointmentTypeService
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
            startDateTime: formatDate(travel.start,'YYYY-MM-ddTHH:mm', 'en-US'),
            endDateTime: formatDate(travel.end, 'YYYY-MM-ddTHH:mm', 'en-US'),
            label: "Travel Time: " + appointment.travelHours,
            type: TypeEnum.Trvl,
            disabled: false,
            travelHours: '',
            returnHours: '',
            serviceCenter: 0,
            addendumLaborHours: '',
            addendumName: '',
            billingCustName: '',
            JobsiteAddress: '',
          });
        }
      },
      errorHandler: (error:any) => {
        notify(error.message, 'error', 5000)
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
    this.appointmentTypeData = this.appointmentTypeService.getAppointmentTypes();
  }

  /*** Event Handlers ***/

  /*
   * dx-speed-dial-action onClick Event Handler.
   */
  //  showAppointmentPopup(e:any) {
  //   this.dxScheduler.instance.showAppointmentPopup();
  // }


  /*
   * Filter Component OnChange Event Handler
   */
  onFilterChange(e:any){
    //update filter
    this.filterValues = e.detail;
    //reload data
    //this.reload();
  }

  /*** Helper Methods ***/

  /*
  * Unhide the Filter
  */
  displayFilter() {
    this.filterVisible = true;
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


}
