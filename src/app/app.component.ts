/* eslint-disable no-prototype-builtins */
/* eslint-disable  @typescript-eslint/no-inferrable-types */

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

interface ApiObject {
  [key: string]: string | ApiObject;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  private paciente: any = new Paciente();
  private patient: any = new Patient();
  private mapping = mappingJSON as any;
  private delimiterChar = '.';

  private apiResponse: ApiObject = {
    'Nivel1-A': {
      'Nivel2-A': {
        'Nivel3-A': '',
        'Nivel3-B': '',
      },
      'Nivel2-B': {
        'Nivel3-C': '',
        'Nivel3-D': '',
      },
    },
    'Nivel1-B': {
      'Nivel2-C': {
        'Nivel3-E': '',
        'Nivel3-F': '',
      },
      'Nivel2-D': {
        'Nivel3-G': '',
        'Nivel3-H': '',
      },
    },
  };

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
    this.logger.info('patient: ', {
      component: this.constructor.name,
      value: this.patient,
    });
    this.logger.info('paciente: ', {
      component: this.constructor.name,
      value: this.paciente,
    });

    const flattenedJson = this.flattenApiObject(this.apiResponse);
    console.log('flattenedJson: ', flattenedJson);

    const flattenedPaciente = this.flattenApiObject(this.paciente);
    /** Descarga el archivo */
    // this.downloadFile(flattenedPaciente);
    console.log('flattenedPaciente: ', flattenedPaciente);
  }

  /** esta función itera todos los nodos del json de conversión. Busca el equivalente
   *  en castellano de la propiedad en inglés. Si el equivalente en castellano es un
   *  objeto anidado se llama a si misma.
   */
  private castPaciente(property?: string, mapping?: any): void {
    /** Inicialmente los parámetros property y mapping no se informan. Solo se
     *  informan en las llamadas recursivas.
     */
    // console.error('property: ', property);
    // console.warn('mapping: ', mapping);
    let patient = this.patient;

    /** Si property existe es que se ha llamado a si misma. */
    if (property) {
      const propertySplit = property.split(this.delimiterChar);

      /** Verifica si el nodo resultante es sencillo o anidado. */
      /** ¿? */
      if (propertySplit.length > 1) {
        for (const part of propertySplit) {
          patient = patient[part];
          this.logger.warning('patient: ', {
            component: this.constructor.name,
            value: patient,
          });
        }
      } else {
        patient = this.patient[property];
        this.logger.warning('patient: ', {
          component: this.constructor.name,
          value: patient,
        });
      }
    }

    this.logger.success('mapping: ', {
      component: this.constructor.name,
      value: this.mapping,
    });
    /** Si mapping no existe es que el equivalente en castellano no es un objeto
     *  anidado. Es decir, el nodo en inglés equivale a un nodo sencillo en castellano.
     */
    if (!mapping) {
      mapping = this.mapping;
    }

    /** Itera los nodos en inglés y obtiene la correlación en castellano. */
    for (const prop in mapping) {
      const pacienteProperty = mapping[prop];
      const pacienteValue = patient[prop];

      /** Si la función no se ha llamado a si misma: */
      if (!property) {
        /** Verifica si el objeto en inglés tiene informada la propiedad del nodo. */
        if (patient.hasOwnProperty(prop)) {
          /** Verifica si el equivalente en castellano es una propiedad anidada. */
          if (typeof mapping[prop] === 'object') {
            /** Si es un objeto se llama a si misma. */
            this.castPaciente(prop, mapping[prop]);
          } else {
            /** Si no es un objeto le aplica el valor de la propiedad del objeto en
             *  inglés a la propiedad del objeto en castellano.
             */
            this.setPacienteValue(pacienteProperty, pacienteValue);
          }
        }
      } else {
        /** Si se ha llamado a si misma: */
        /** Verifica si el objeto en inglés tiene informada la propiedad del nodo. */
        if (patient.hasOwnProperty(prop)) {
          /** Verifica si el equivalente en castellano es una propiedad anidada. */
          if (typeof mapping[prop] === 'object') {
            /** Si es un objeto se llama a si misma. */
            this.castPaciente(`${property}.${prop}`, mapping[prop]);
          } else {
            /** Si no es un objeto le aplica el valor de la propiedad del objeto en
             *  inglés a la propiedad del objeto en castellano.
             */
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
      .pipe(
        tap(() =>
          this.logger.info('observable2 -> start', {
            component: this.constructor.name,
          })
        )
      )
      .subscribe({
        next: (observable2) => {
          this.logger.groupCollapsed(
            'El Observable ha respondido correctamente',
            {
              component: this.constructor.name,
              group: {
                groupTitle: 'Trazas observable',
                action: 'start',
                type: 'success',
              },
            }
          );
          this.logger.groupCollapsed('observable2 -> result ->', {
            component: this.constructor.name,
            value: observable2,
            group: {
              groupTitle: 'Trazas observable',
              action: 'end',
              type: 'success',
            },
          });
        },
        error: (error) => {
          this.logger.error(`observable2 -> error ->`, error.message);
        },
        complete: () => {
          this.logger.info('observable2 -> complete', {
            component: this.constructor.name,
          });
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
        this.logger.group('Primera traza: ', {
          value: primerObservable,
          component: this.constructor.name,
          group: {
            groupTitle: 'Trazas forkJoin',
            action: 'start',
            type: 'warning',
          },
        });

        this.logger.group('Segunda traza: ', {
          value: segundoObservable,
          component: this.constructor.name,
          group: {
            groupTitle: 'Trazas forkJoin',
            action: 'intermediate',
            type: 'info',
          },
        });

        setTimeout(() => {
          this.logger.group('Última traza: ', {
            value: tercerObservable,
            component: this.constructor.name,
            group: {
              groupTitle: 'Trazas forkJoin',
              action: 'end',
              type: 'success',
            },
          });
        }, 2000);
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
    this.logger.success('FIN', { component: this.constructor.name });
  }

  private flattenApiObject(
    apiObj: ApiObject,
    parentKey: string = ''
  ): { [key: string]: string } {
    let result: { [key: string]: string } = {};

    for (const key in apiObj) {
      if (typeof apiObj[key] === 'string') {
        result[key] = parentKey ? `${parentKey}.${key}` : key;
      } else {
        const newParentKey = parentKey ? `${parentKey}.${key}` : key;
        const nestedResult = this.flattenApiObject(
          apiObj[key] as ApiObject,
          newParentKey
        );
        result = { ...result, ...nestedResult };
      }
    }

    return result;
  }

  private downloadFile(flattenedJson: any): void {
    const jsonData = JSON.stringify(flattenedJson);
    const blob = new Blob([jsonData], { type: 'application/json' });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'flattenedJson.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
