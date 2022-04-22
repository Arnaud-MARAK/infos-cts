export default class Schedule {
    code: string;
    ref: string;
    name: string;
    vehicleMod: string;
    destinationName: string;
    destinationShortName: string;
    lineRef: string;
    expectedArrived: string;

    constructor(code: string, ref: string, name: string, vMod: string, dName: string, dsName: string, lineRef: string, expectedA: string) {
        this.code = code;
        this.ref = ref;
        this.name = name;
        this.vehicleMod = vMod.toLocaleUpperCase();
        this.destinationName = dName;
        this.destinationShortName = dsName;
        this.lineRef = lineRef;
        this.expectedArrived = expectedA;
    }

    getExpectArrivedText() : string {
        return this.expectedArrived.substring(11, 19);
    }
}
