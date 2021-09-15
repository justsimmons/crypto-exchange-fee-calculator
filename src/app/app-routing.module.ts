import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExchangeFeesComparatorComponent } from './components/exchange-fees-comparator/exchange-fees-comparator/exchange-fees-comparator.component';

const routes: Routes = [
  { path: 'exchange-fee-comparison', component: ExchangeFeesComparatorComponent },
  { path: '', redirectTo: 'exchange-fee-comparison', pathMatch: 'full' },
  { path: '**', redirectTo: 'exchange-fee-comparison' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
