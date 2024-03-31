import { Injectable, isDevMode } from '@angular/core';

/* Decorador para habilitar métodos solo en modo de desarrollo. */
function DevModeOnly(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    if (!isDevMode()) {
      return;
    }

    return originalMethod.apply(this, args);
  };

  return descriptor;
}

declare type LoggerType = 'info' | 'success' | 'warning' | 'error';

export interface Param {
  value?: any;
  componentName: any;
}

export interface ParamWithGroup extends Param {
  group: {
    groupTitle: string;
    action: 'start' | 'intermediate' | 'end';
    type: LoggerType;
  };
}

export interface ParamWithTimer extends Param {
  timer: {
    label: string;
  };
}

interface Group {
  groupTitle: string;
  params: ParamWithGroup[];
}

interface Timer {
  label: string;
  params: ParamWithTimer;
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private colors = {
    info: '#29B6F6',
    success: '#00E676',
    warning: '#FF9100',
    error: '#F44336',
  };
  private fontSize = '.8rem';
  private fontFamily = 'Segoe ui';
  private fontWeight = '500';

  private groups: Group[] = [];
  private TimerLabels: Timer[] = [];

  constructor() {
    /* Verifica si existe la cookie y si no existe la crea. */
    const cookieName = 'nfm-logger';
    const defaultValue = { disabledLogs: [] };
    const existingCookie = document.cookie.split(';').some((cookie) => cookie.trim().startsWith(`${cookieName}=`));

    if (!existingCookie) {
      document.cookie = `${cookieName}=${JSON.stringify(defaultValue)};path=/`;
    }
  }

  //#region Básicos.
  @DevModeOnly
  public info(message: string, params: Param): void {
    this.logWithStyle(message, 'info', params);
  }

  @DevModeOnly
  public success(message: string, params: Param): void {
    this.logWithStyle(message, 'success', params);
  }

  @DevModeOnly
  public warning(message: string, params: Param): void {
    this.logWithStyle(message, 'warning', params);
  }

  @DevModeOnly
  public error(message: string, params: Param): void {
    this.logWithStyle(message, 'error', params);
  }
  //#endregion Básicos

  //#region Console group.
  @DevModeOnly
  public group(message: string, params: ParamWithGroup): void {
    if (!params.group) {
      return;
    }

    this.manageGroup(message, params);

    if (params.group.action === 'end') {
      this.logGroupWithStyle(params.group.groupTitle, 'expanded');
    }
  }

  @DevModeOnly
  public groupCollapsed(message: string, params: ParamWithGroup): void {
    if (!params.group) {
      return;
    }

    this.manageGroup(message, params);

    if (params.group.action === 'end') {
      this.logGroupWithStyle(params.group.groupTitle, 'collapsed');
    }
  }

  private manageGroup(message: string, params: ParamWithGroup): void {
    const groupFound = this.groups.find((item) => item.groupTitle === params.group?.groupTitle);

    if (!groupFound && (params.group?.action === 'intermediate' || params.group?.action === 'end')) {
      console.error(`No se ha encontrado el grupo '${params.group.groupTitle}'.`);
      return;
    }

    if (groupFound) {
      groupFound.params.push(
        Object.assign(params, {
          ...params,
          message,
          time: new Date().toLocaleTimeString(),
        })
      );
    } else {
      this.groups.push({
        groupTitle: params.group?.groupTitle ?? '',
        params: [
          Object.assign(params, {
            ...params,
            message,
            time: new Date().toLocaleTimeString(),
          }),
        ],
      });
    }
  }
  //#endregion Console group

  //#region Calcula tiempos de ejecución.
  @DevModeOnly
  public timeStart(message: string, params: ParamWithTimer): void {
    if (!params.timer) {
      return;
    }

    const timerLabelFound = this.TimerLabels.find((item) => item.label === params.timer.label);

    if (timerLabelFound) {
      console.error(`El grupo '${params.timer.label}' ya existe.`);
      return;
    }

    this.TimerLabels.push({
      label: params.timer.label,
      params: Object.assign(params, {
        ...params,
        message,
        time: new Date(),
      }),
    });
  }

  @DevModeOnly
  public timeEnd(params: ParamWithTimer): void {
    const index = this.TimerLabels.findIndex((item) => item.label === params.timer.label);

    if (index < 0) {
      console.error(`No se ha encontrado el grupo '${params.timer.label}'.`);
      return;
    }

    this.logTimerWithStyle(index);
  }
  //#endregion Calcula tiempos de ejecución.

  private logWithStyle(message: string, type: LoggerType, params: Param): void {
    const color = this.colors[type];

    console.log(
      `%c[${new Date().toLocaleTimeString()}] - ${params?.componentName}\n%c${message}`,
      `color:${color}; font-size:.7rem; font-family:${this.fontFamily}; font-weight:200;`,
      `color:${color}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
      params?.value ?? ''
    );
  }

  private logGroupWithStyle(groupTitle: string, groupType: 'expanded' | 'collapsed'): void {
    const index = this.groups.findIndex((item) => item.groupTitle === groupTitle);

    if (index < 0) {
      console.error(`No se ha encontrado el grupo '${groupTitle}'.`);
      return;
    }

    const groupFound = this.groups[index] as any;
    const groupColor = '#78909C';

    if (groupType === 'expanded') {
      console.group(
        `%c${groupTitle}%c\n(haz click para mostrar/ocultar)`,
        `color:${groupColor}; font-size:1rem; background-color:#424242; border-radius:2.5px; padding:2px 5px;`,
        `color:${groupColor}; font-size:.6rem; font-weight:100;`
      );
    } else {
      console.groupCollapsed(
        `%c${groupTitle}%c\n(haz click para mostrar/ocultar)`,
        `color:${groupColor}; font-size:1rem; background-color:#424242; border-radius:2.5px; padding:2px 5px;`,
        `color:${groupColor}; font-size:.6rem; font-weight:100;`
      );
    }

    for (const param of groupFound.params) {
      const color = this.colors[param.group.type as LoggerType];

      console.log(
        `%c[${param.time}] - ${param.componentName}\n%c${param.message}`,
        `color:${color}; font-size:.7rem; font-family:${this.fontFamily}; font-weight:200;`,
        `color:${color}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
        param.value ?? ''
      );
    }

    console.groupEnd();

    this.groups.splice(index, 1);
  }

  private logTimerWithStyle(index: number): void {
    const color = this.colors.info;
    const timer = this.TimerLabels[index] as any;
    const elapsedTime = ((new Date().getTime() - (timer.params.time as Date).getTime()) / 1000).toFixed(3);

    const params = timer.params;

    console.log(
      `%c[${new Date().toLocaleTimeString()}] - ${params?.componentName}\n%cEl proceso '${
        params.message
      }' ha tardado ${elapsedTime} segundos en completarse`,
      `color:${color}; font-size:.7rem; font-family:${this.fontFamily}; font-weight:200;`,
      `color:${color}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`
    );

    this.TimerLabels.splice(index, 1);
  }
}
