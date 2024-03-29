import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { PruebaDirective } from './prueba.directive';
import { AppComponent } from './app.component';
import { SideBarComponent } from './side-bar/side-bar.component';

@NgModule({
  declarations: [AppComponent, PruebaDirective],
  imports: [BrowserModule, AppRoutingModule, SideBarComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
