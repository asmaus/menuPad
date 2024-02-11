export class Patient {
	name!: string;
	surname!: string;
	referer: Referer = new Referer();
	center: Center = new Center();
	builder: Builder = new Builder();
}

export class Referer {
	nameReferer!: string;
	surnameReferer!: string;
}

export class Center {
	nameCenter!: string;
	aliasCenter!: string;
}

export class Builder {
	patern: Patern = new Patern()
}

export class Patern {
	pg: Page = new Page();
}

export class Page {
	pageName!:string
}