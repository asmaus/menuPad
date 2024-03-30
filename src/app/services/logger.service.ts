import { Injectable, isDevMode } from '@angular/core';

declare type LoggerType = 'info' | 'success' | 'warning' | 'error';

export interface Param {
  value?: any;
  component: any;
}

export interface ParamWithGroup extends Param {
  group: {
    groupTitle: string;
    action: 'start' | 'intermediate' | 'end';
    type: LoggerType;
  };
}

export interface ParamWithElapsedTime extends Param {
  elapsedTime: {
    label: string;
    action: 'start' | 'end';
  };
}

interface Group {
  groupTitle: string;
  params: Param[];
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

  //TODO Almacenará las etiquetas identificativas de los console.time/console.timeEnd.
  private elapsedTimeLabels: string[] = [];

  //#region Básicos.
  public info(message: string, params: Param): void {
    this.logWithStyle(message, 'info', params);
  }

  public success(message: string, params: Param): void {
    this.logWithStyle(message, 'success', params);
  }

  public warning(message: string, params: Param): void {
    this.logWithStyle(message, 'warning', params);
  }

  public error(message: string, params: Param): void {
    this.logWithStyle(message, 'error', params);
  }
  //#endregion Básicos

  //#region Console group.
  public group(message: string, params: ParamWithGroup): void {
    if (!params.group) {
      return;
    }

    this.manageGroup(message, params);

    if (params.group.action === 'end') {
      this.logGroupWithStyle(params.group.groupTitle, 'expanded');
    }
  }

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
    const groupFound = this.groups.find(
      (item) => item.groupTitle === params.group?.groupTitle
    );

    if (
      !groupFound &&
      (params.group?.action === 'intermediate' ||
        params.group?.action === 'end')
    ) {
      console.error(`No se ha encontrado el grupo ${params.group.groupTitle}.`);
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
  public calculateElapsedTime(
    message: string,
    params: ParamWithElapsedTime
  ): void {
    if (!params.elapsedTime) {
      return;
    }

    switch (params.elapsedTime.action) {
      case 'start':
        break;

      case 'end':
        break;

      default:
        break;
    }
  }
  //#endregion Calcula tiempos de ejecución.

  private logWithStyle(message: string, type: LoggerType, params: Param): void {
    if (!isDevMode) {
      return;
    }

    const color = this.colors[type];

    console.log(
      `%c[${new Date().toLocaleTimeString()}] - ${
        params?.component
      }\n%c${message}`,
      `color:${color}; font-size:.7rem; font-family:${this.fontFamily}; font-weight:200;`,
      `color:${color}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
      params?.value ?? ''
    );
  }

  private logGroupWithStyle(
    groupTitle: string,
    groupType: 'expanded' | 'collapsed'
  ): void {
    if (!isDevMode) {
      return;
    }

    const index = this.groups.findIndex(
      (item) => item.groupTitle === groupTitle
    );

    if (index < 0) {
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
        `%c[${param.time}] - ${param.component}\n%c${param.message}`,
        `color:${color}; font-size:.7rem; font-family:${this.fontFamily}; font-weight:200;`,
        `color:${color}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
        param.value ?? ''
      );
    }

    console.groupEnd();
  }
}
