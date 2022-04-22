import PhysicalStop from '@/class/physicalStop'

export default class Stop {
		logicalStopCode: number;
    name: string;
    physcialStops: Array<PhysicalStop>;

    constructor(logicalStopCode: number, name: string,physcialStops: Array<PhysicalStop>) {
        this.name = name;
        this.logicalStopCode = logicalStopCode;
        this.physcialStops = physcialStops;
    }

    getSalary() : number {
        return 10000;
    }

    getStopPointRefs() : Array<string> {
			const stopPointRefs = [] as Array<string>;

			this.physcialStops.forEach(ps => {
				stopPointRefs.push(ps.stopPointRef)
			})

			return stopPointRefs
    }

		getPhysicalCode() : Array<string> {
			const codes = [] as Array<string>;

			this.physcialStops.forEach(ps => {
				codes.push(ps.code)
			})

			return codes
    }
}