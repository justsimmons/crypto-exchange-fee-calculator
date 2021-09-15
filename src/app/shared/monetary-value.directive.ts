import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function monetaryValueValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
  
      const value = control.value;
  
      // All values are not monetary values but represent possible initial states of the form field
      // The required validator will take care of these cases
      if (value === null || value === undefined || value === '') { 
        return null;
      }
  
      if (isNaN(value)) {
        return { notNumber: true };
      }
  
      // Lower bound for monetary values is 0, there is no upper bound
      if (value < 0) {
        return { negativeNumber: true };
      }
  
      return null;
    }
  }