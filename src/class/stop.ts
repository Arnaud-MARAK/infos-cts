import PhysicalStop from '@/class/physicalStop'

export default class Stop {
    code: number;
    name: string;
    physcialStops: Array<PhysicalStop>;

    constructor(code: number, name: string,physcialStops: Array<PhysicalStop>) {
        this.name = name;
        this.code = code;
        this.physcialStops = physcialStops;
    }

    getSalary() : number {
        return 10000;
    }

    getRefs() : Array<string> {
			const refs = [] as Array<string>;

			this.physcialStops.forEach(ps => {
				refs.push(ps.ref)
			})

			return refs
    }

		getUrlRefs(url: string) : string {
			
			const refs = this.getRefs();

			for(let i = 0; i < refs.length; i++){
				if(i == 0){
					url = url + "?MonitoringRef=" + refs[i]
				} else {
					url = url + "&MonitoringRef=" + refs[i]
					
				}
			}

			return url
		}
}