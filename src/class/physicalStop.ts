export default class PhysicalStop {
    code: string;
    stopPointRef: string;
    longitude: number;
    latitude: number;
    isFlexhopStop: boolean;

    constructor(code: string, ref: string, lon: number, lat: number, isFlexhop: boolean) {
        this.code = code;
        this.stopPointRef = ref;
        this.longitude = lon;
        this.latitude = lat;
        this.isFlexhopStop = isFlexhop
    }
}
