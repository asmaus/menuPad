import { Injectable, isDevMode } from '@angular/core';

declare type LoggerType = 'info' | 'success' | 'warning' | 'error';

export interface Param {
  value?: any,
  component?: any
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

  private logWithStyle(message: string, type: LoggerType, params: Param): void {
    // console.time('ini');

    if (!isDevMode) {
      return;
    }

    const color = this.colors[type];

    console.log(
      `%c[${new Date().toLocaleTimeString()}] - ${params?.component}\n%c${message}`,
      `color:${color}; font-size:.7rem; font-family:${this.fontFamily}; font-weight:200;`,
      `color:${color}; font-size:${this.fontSize}; font-family:${this.fontFamily}; font-weight:${this.fontWeight};`,
      params?.value ?? ''
    );

    // console.timeEnd('ini')
  }
}
