import { Component, OnInit } from '@angular/core';
import { CustomObserverService } from './services/custom-observer.service';
import { LoggerService } from './services/logger.service';
import {
  concatMap,
  delay,
  forkJoin,
  from,
  of,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public constructor(
    private logger: LoggerService,
    private observerSrv: CustomObserverService
  ) { }

  public ngOnInit(): void {
    //#region 1
    const observable2$ = this.observerSrv.observable2();

    observable2$
      .pipe(
        tap(() => this.logger.info('observable2 -> start')),
      )
      .subscribe({
        next: (observable2) => {
          console.groupCollapsed('%cTrazas observable2 %c(haz click para mostrar/ocultar)', 'color:#00E676; font-size:1rem;', 'color:#00E676; font-size:.6rem; font-weight:100');
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

    forkJoin([primerObservable$, segundoObservable$, tercerObservable$])
      .subscribe({
        next: ([primerObservable, segundoObservable, tercerObservable]) => {
          console.group('%cTrazas forkJoin %c(haz click para mostrar/ocultar)', 'color:#00E676; font-size:1rem;', 'color:#00E676; font-size:.6rem; font-weight:100');
          console.log(primerObservable);
          console.log(segundoObservable);
          console.log(tercerObservable);
          console.groupEnd();
        },
      });
    //#endregion 2
  }
}
