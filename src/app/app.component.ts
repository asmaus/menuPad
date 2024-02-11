import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CustomObserverService } from './services/custom-observer.service';
import { LoggerService } from './services/logger.service';
import {
  concatMap,
  delay,
  forkJoin,
  from,
  interval,
  of,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs';
import { Paciente } from './paciente.model';
import { Patient } from './patient.model';

import mappingJSON from './patient-converter.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  private paciente: any = new Paciente();
  private patient: any = new Patient();
  private mapping = mappingJSON as any;

  public constructor(
    private logger: LoggerService,
    private observerSrv: CustomObserverService
  ) {
    this.patient.name = 'Pedro';
    this.patient.surname = 'Piqueras';
    this.patient.referer.nameReferer = 'Carlos';
    this.patient.referer.surnameReferer = 'Fuentes';
    this.patient.center.nameCenter = 'TEST';
    this.patient.center.aliasCenter = 'T';
    this.patient.builder.patern.pg.pageName = 'info';
  }
  ngAfterViewInit(): void {
    this.castPaciente();
    console.log('paciente: ', this.paciente);
    console.log('patient: ', this.patient);
  }

  private castPaciente(property?: string, mapping?: any): void {
    let patient = this.patient;

    if (property) {
      const propertySplit = property.split('.');

      if (propertySplit.length > 1) {
        for (const part of propertySplit) {
          patient = patient[part];
        }
      } else {
        patient = this.patient[property];
      }
    }

    if (!mapping) {
      mapping = this.mapping;
    }

    for (const prop in mapping) {
      const pacienteProperty = mapping[prop];
      const pacienteValue = patient[prop];

      if (!property) {
        if (patient.hasOwnProperty(prop)) {
          if (typeof mapping[prop] === 'object') {
            this.castPaciente(prop, mapping[prop]);
          } else {
            this.setPacienteValue(pacienteProperty, pacienteValue);
          }
        }
      } else {
        if (patient.hasOwnProperty(prop)) {
          if (typeof mapping[prop] === 'object') {
            this.castPaciente(`${property}.${prop}`, mapping[prop]);
          } else {
            this.setPacienteValue(pacienteProperty, pacienteValue);
          }
        }
      }
    }
  }

  private setPacienteValue(property: string, value: any): void {
    const propertySplit = property.split('.');
    let paciente = this.paciente;

    if (propertySplit.length > 1) {

      for (let i = 0; i < propertySplit.length; i++) {
        const prop = propertySplit[i];

        if (i === propertySplit.length - 1) {
          paciente[prop] = value;
        } else {
          if (!paciente.hasOwnProperty(prop)) {
            paciente[prop] = {};
            paciente = paciente[prop];
          } else {
            paciente = paciente[prop];
          }
        }
      }
    } else {
      paciente[property] = value;
    }
  }


  public ngOnInit(): void {
    //#region 1
    const observable2$ = this.observerSrv.observable2();

    observable2$
      .pipe(tap(() => this.logger.info('observable2 -> start')))
      .subscribe({
        next: (observable2) => {
          console.groupCollapsed(
            '%cTrazas observable2 %c(haz click para mostrar/ocultar)',
            'color:#00E676; font-size:1rem;',
            'color:#00E676; font-size:.6rem; font-weight:100'
          );
          this.logger.success('El Observable ha respondido correctamente');
          this.logger.success(`observable2 -> result ->`, observable2);
          console.groupEnd();
        },
        error: (error) => {
          this.logger.error(`observable2 -> error ->`, error.message);
        },
        complete: () => {
          this.logger.info('observable2 -> complete');
        },
      });
    //#endregion 1

    //#region 2
    const primerObservable$ = from([1]);
    const segundoObservable$ = primerObservable$.pipe(
      delay(1000),
      concatMap((value) => of(value * 2))
    );
    const tercerObservable$ = from([3]).pipe(delay(100));

    forkJoin([
      primerObservable$,
      segundoObservable$,
      tercerObservable$,
    ]).subscribe({
      next: ([primerObservable, segundoObservable, tercerObservable]) => {
        console.group(
          '%cTrazas forkJoin %c(haz click para mostrar/ocultar)',
          'color:#00E676; font-size:1rem;',
          'color:#00E676; font-size:.6rem; font-weight:100'
        );
        console.log(primerObservable);
        console.log(segundoObservable);
        console.log(tercerObservable);
        console.groupEnd();
      },
    });
    //#endregion 2

    //#region 3
    const source$ = interval(5000);
    const obs$ = of('xxxxxxx');

    let contador = 1;

    const subscription$ = source$.pipe(
      switchMap(() => obs$),
      takeWhile(() => contador < 6)
    );

    subscription$.subscribe({
      next: (data) => {
        console.log(`${data}_${contador}`);
        contador++;

        if (contador === 5) {
          observable2$;
        }
      },
      complete: () => {
        this.continua();
      },
    });

    //#endregion 3
  }

  private continua(): void {
    console.log('FIN');
  }
}
