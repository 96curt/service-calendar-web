export class FilterModel {
    regions:number[] = [];
    centers:number[] = [];
    managers:number[] = [];
    cities:number[] = [];
    zipCodes: string[] = [];
    techs:number[] = [];
    
    clear(){
        this.regions=[];
        this.centers=[];
        this.managers=[];
        this.cities=[];
        this.zipCodes=[];
        this.techs=[];
    }
}
