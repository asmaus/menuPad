import { Injectable, isDevMode } from '@angular/core';

/* Decorador para verificar si está en un entorno de desarrollo y si los logs del componente o del método están deshabilitados. */
function DevModeAndLogsEnabled(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    if (!isDevMode()) {
      return;
    }

    /* Verifica si existe la cookie y si no existe la crea. */
    const existingCookie = document.cookie.split(';').some((cookie) => cookie.trim().startsWith(`${NfmLoggerService.cookieName}=`));

    if (!existingCookie) {
      NfmLoggerService.setCookie();
    }

    const params = args.length > 1 ? args[1] : args[0];
    const cookieValue = document.cookie
      .split(';')
      .find((cookie) => cookie.trim().startsWith(`${NfmLoggerService.cookieName}=`))
      ?.split('=')[1];

    if (cookieValue) {
      //TODO Crear intellisense. Que los valores de eliminar del array lo obtenga de la cookie.
      const { disabledComponents, disabledMethods } = JSON.parse(cookieValue);

      if (disabledComponents.includes(params.componentName) || disabledMethods.includes(`${params.componentName}/${params.methodName}`)) {
        return;
      }
    }

    return originalMethod.apply(this, args);
  };

  return descriptor;
}

declare type LoggerType = 'info' | 'success' | 'warning' | 'error';

export interface Param {
  componentName: string;
  methodName: string;
  value?: any;
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
export class NfmLoggerService {
  public static cookieName = 'nfm-logger';
  public cookieValue!: string | undefined;

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
    this.cookieValue = document.cookie
      .split(';')
      .find((cookie) => cookie.trim().startsWith(`${NfmLoggerService.cookieName}=`))
      ?.split('=')[1];

    if (this.cookieValue) {
      const { config } = JSON.parse(this.cookieValue);
      Object.assign(this.colors, config.colors);
      this.fontSize = config.fontSize;
    }
  }

  //#region Básicos.
  @DevModeAndLogsEnabled
  public info(message: string, params: Param): void {
    this.logWithStyle(message, 'info', params);
  }

  @DevModeAndLogsEnabled
  public success(message: string, params: Param): void {
    this.logWithStyle(message, 'success', params);
  }

  @DevModeAndLogsEnabled
  public warning(message: string, params: Param): void {
    this.logWithStyle(message, 'warning', params);
  }

  @DevModeAndLogsEnabled
  public error(message: string, params: Param): void {
    this.logWithStyle(message, 'error', params);
  }
  //#endregion Básicos

  //#region Console group.
  @DevModeAndLogsEnabled
  public group(message: string, params: ParamWithGroup): void {
    if (!params.group) {
      return;
    }

    this.manageGroup(message, params);

    if (params.group.action === 'end') {
      this.logGroupWithStyle(params.group.groupTitle, 'expanded');
    }
  }

  @DevModeAndLogsEnabled
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
  @DevModeAndLogsEnabled
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

  @DevModeAndLogsEnabled
  public timeEnd(params: ParamWithTimer): void {
    const index = this.TimerLabels.findIndex((item) => item.label === params.timer.label);

    if (index < 0) {
      console.error(`No se ha encontrado el grupo '${params.timer.label}'.`);
      return;
    }

    this.logTimerWithStyle(index);
  }
  //#endregion Calcula tiempos de ejecución.

  //#region Comunes
  private logWithStyle(message: string, type: LoggerType, params: Param): void {
    const color = this.colors[type];
    const timeFontSize = `${parseFloat(this.fontSize) - 0.1}rem`;

    console.log(
      `%c[${new Date().toLocaleTimeString()}] - ${params?.componentName} - ${params?.methodName}\n%c${message}`,
      `color:${color}; font-size:${timeFontSize}; font-family:${this.fontFamily}; font-weight:200;`,
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
      const timeFontSize = `${parseFloat(this.fontSize) - 0.1}rem`;

      console.log(
        `%c[${param.time}] - ${param.componentName} - ${param.methodName}\n%c${param.message}`,
        `color:${color}; font-size:${timeFontSize}; font-family:${this.fontFamily}; font-weight:200;`,
        `color:${color}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
        param.value ?? ''
      );
    }

    console.groupEnd();

    this.groups.splice(index, 1);
  }

  private logTimerWithStyle(index: number): void {
    const color = this.colors.info;
    const timeFontSize = `${parseFloat(this.fontSize) - 0.1}rem`;
    const timer = this.TimerLabels[index] as any;
    const elapsedTime = ((new Date().getTime() - (timer.params.time as Date).getTime()) / 1000).toFixed(3);

    const params = timer.params;

    console.log(
      `%c[${new Date().toLocaleTimeString()}] - ${params?.componentName} - ${params?.methodName}\n%cEl proceso '${
        params.message
      }' ha tardado ${elapsedTime} segundos en completarse`,
      `color:${color}; font-size:${timeFontSize}; font-family:${this.fontFamily}; font-weight:200;`,
      `color:${color}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`
    );

    this.TimerLabels.splice(index, 1);
  }
  //#endregion Comunes

  //#region Gestión
  public _disableComponentLogs(componentName: string): void {
    if (this.cookieValue) {
      const { disabledComponents, disabledMethods, config } = JSON.parse(this.cookieValue);
      disabledComponents.push(componentName);

      NfmLoggerService.setCookie({ disabledComponents, disabledMethods, config });
    }
  }

  public _disableMethodLogs(methodName: string, componentName: string): void {
    if (this.cookieValue) {
      const { disabledComponents, disabledMethods, config } = JSON.parse(this.cookieValue);
      disabledMethods.push(`${componentName}/${methodName}`);

      NfmLoggerService.setCookie({ disabledComponents, disabledMethods, config });
    }
  }

  public _enableComponentLogs(componentName: string): void {
    if (this.cookieValue) {
      const { disabledComponents, disabledMethods, config } = JSON.parse(this.cookieValue);
      const index = disabledComponents.findIndex((cName: string) => cName === componentName);

      if (index > -1) {
        disabledComponents.splice(index, 1);
      }

      NfmLoggerService.setCookie({ disabledComponents, disabledMethods, config });
    }
  }

  public _enableMethodLogs(methodName: string, componentName: string): void {
    if (this.cookieValue) {
      const { disabledComponents, disabledMethods, config } = JSON.parse(this.cookieValue);
      const index = disabledMethods.findIndex((mName: string) => mName === `${componentName}/${methodName}`);

      if (index > -1) {
        disabledMethods.splice(index, 1);
      }

      NfmLoggerService.setCookie({ disabledComponents, disabledMethods, config });
    }
  }

  public _getDisablesList(): void {
    if (this.cookieValue) {
      const { disabledComponents, disabledMethods } = JSON.parse(this.cookieValue);
      console.log('_getDisablesList() ', { disabledComponents, disabledMethods });
    }
  }

  public _setConfig(config: any): void {
    if (this.cookieValue) {
      const { disabledComponents, disabledMethods } = JSON.parse(this.cookieValue);

      NfmLoggerService.setCookie({ disabledComponents, disabledMethods, config });
    }
  }

  public _restoreConfig(): void {
    if (this.cookieValue) {
      const { disabledComponents, disabledMethods } = JSON.parse(this.cookieValue);
      const config = {
        colors: {
          info: '#29B6F6',
          success: '#00E676',
          warning: '#FF9100',
          error: '#F44336',
        },
        fontSize: '.8rem',
      };

      NfmLoggerService.setCookie({ disabledComponents, disabledMethods, config });
    }
  }

  public _getConfig(): void {
    if (this.cookieValue) {
      const { config } = JSON.parse(this.cookieValue);
      console.log('_getConfig() ', { config });
    }
  }
  //#endregion Gestión

  //#region Internal
  public static setCookie(value = { disabledComponents: [], disabledMethods: [], config: {} } as any): void {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1);

    if (Object.keys(value.config).length === 0) {
      value.config = {
        colors: new NfmLoggerService().colors,
        fontSize: new NfmLoggerService().fontSize,
      };
    }

    const updatedCookieValue = {
      disabledComponents: [...new Set(value.disabledComponents)],
      disabledMethods: [...new Set(value.disabledMethods)],
      config: value.config,
    };

    document.cookie = `${this.cookieName}=${JSON.stringify(updatedCookieValue)}; expires=${currentDate.toUTCString()}`;
  }
  //#endregion Internal
}
