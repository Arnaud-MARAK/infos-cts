export default class PhysicalStop {
    logicalStopCode: string;
    ref: string;
    longitude: number;
    latitude: number;
    isFlexhopStop: boolean;

    constructor(logicalStopCode: string, ref: string, lon: number, lat: number, isFlexhop: boolean) {
        this.logicalStopCode = logicalStopCode;
        this.ref = ref;
        this.longitude = lon;
        this.latitude = lat;
        this.isFlexhopStop = isFlexhop
    }
}
