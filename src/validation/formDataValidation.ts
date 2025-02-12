import { FormDataParams } from '../models/FormDataParams';
import { TFunction } from 'i18next';
export interface ValidationError {
    field: string;
    message: string;
}

export const ValidateFormData = (formData: FormDataParams, currentStep: number, t: TFunction): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (currentStep === 1) {
        if (formData.year <= 0) {
            errors.push({ field: 'year', message: t('MinusYearError') });
        } else if (formData.year > new Date().getFullYear()) {
            errors.push({ field: 'year', message: t('FutureYearError') });
        }
        else if(formData.year <= 2014){
            errors.push({ field: 'year', message: t('EarlyYearError') });
        }
        
        if (formData.directiveFixedPrice <= 0) {
            errors.push({ field: 'directiveFixedPrice', message: t('FixedPriceError') });
        }
    }

    if (currentStep === 2) {
        if(!formData.houseType){
            console.log(formData.houseType.toString())
            errors.push({ field: 'houseType', message: t('HouseTypeError') });
        }
    }
    
    if (currentStep === 3) {
        if (formData.squareMeters <= 0) {
            errors.push({ field: 'squareMeters', message: t('SquareMetersError') });
        }
        if (formData.numberOfResidents <= 0) {
            errors.push({ field: 'numberOfResidents', message: t('NumberOfResidentsError') });
        }
    }

    if (currentStep === 3) {
        if(!formData.workShiftType){
            console.log(formData.workShiftType.toString())
            errors.push({ field: 'workShiftType', message: t('WorkShiftTypeError') });
        }
    }

    if (formData.hasSauna && !formData.saunaHeatingFrequency) {
        errors.push({ field: 'saunaHeatingFrequency', message: t('SaunaUsageError') });
    }


    if (formData.hasSauna) {
        if (!formData.saunaHeatingFrequency || formData.saunaHeatingFrequency <= 0) {
            errors.push({ field: 'saunaHeatingFrequency', message: t('SaunaUsageError') });
        }
    }

    if (formData.hasFirePlace && !formData.firePlaceHeatingFrequency) {
        errors.push({ field: 'firePlaceHeatingFrequency', message: t('FirePlaceUsageError') });
    }

    if (formData.hasFirePlace) {
        if (!formData.firePlaceHeatingFrequency || formData.firePlaceHeatingFrequency <= 0) {
            errors.push({ field: 'firePlaceHeatingFrequency', message: t('FirePlaceUsageError') });
        }
    }

    if (formData.hasElectricCar) {
        if (!formData.electricCarCount || formData.electricCarCount <= 0) {
            errors.push({ field: 'electricCarCount', message: t('NumberOfElectricCarsError') });
        }

        if (!formData.electricCarKwhUsagePerYear || formData.electricCarKwhUsagePerYear <= 0) {
            errors.push({ field: 'electricCarKwhUsagePerYear', message: t('ElectricCarUsageError') });
        }
    }

    if (currentStep === 4) {
        if(!formData.heatingType){
            console.log(formData.heatingType.toString())
            errors.push({ field: 'heatingType', message: t('HeatingTypeError') });
        }
    }

    if (currentStep === 5 && formData.hasFloorHeating) {
        if (formData.floorHeatingSquareMeters === undefined || formData.floorHeatingSquareMeters === null) {
            errors.push({ field: 'floorHeatingSquareMeters', message: t('FloorHeatingEmptyError') });
        } else if (formData.floorHeatingSquareMeters <= 0) {
            errors.push({ field: 'floorHeatingSquareMeters', message: t('FloorHeatingError') });
        }
    }

    if (formData.houseType === 'DetachedHouse' || formData.houseType === 'Cottage' && formData.hasSolarPanels === true) {
        if (!formData.solarPanelCount || formData.solarPanelCount <= 0) {
            errors.push({ field: 'solarPanelCount', message: t('SolarPanelCountError') });
        }
    }

    return errors;
};

export default ValidateFormData;