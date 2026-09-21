import { Service } from '@angular/core';


export interface HeadbarKeys {
  analysys: boolean;
  measure: boolean;
  save: boolean;
}

@Service()
export class AMService {
    public headbarKeys: HeadbarKeys = {
        analysys: false,
        measure: false,
        save: false
    }
  
    public resetAMServiceVariables(): void{
        for (const key in this.headbarKeys) {
            this.headbarKeys[key as keyof HeadbarKeys] = false;
        }
    }

    checkButt(arg: keyof HeadbarKeys): void {
        for (const key in this.headbarKeys) {
        const typedKey = key as keyof HeadbarKeys;
        if (key !== arg) {
            this.headbarKeys[typedKey] = false;
        } else {
            this.headbarKeys[typedKey] = !this.headbarKeys[typedKey];
        }
        }
    }

    analysysOut(): void {
        this.checkButt('analysys');
    }

    measureOut(): void {
        this.checkButt('measure');
    }

}
