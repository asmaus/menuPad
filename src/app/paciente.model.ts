export class Paciente {
	nombre!: string;
	apellidos!: string;
	referidorNombre!: string;
	referidorApellidos!: string;
	centro!: Centro;
}

export class Centro {
	nombreCentro!: string;
	aliasCentro!: string;
}