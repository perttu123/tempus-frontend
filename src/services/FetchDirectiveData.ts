import { FormDataParams, CalculationResult } from '../models/FormDataParams';

export const calculatePriceAndConsumption = async (formData: FormDataParams): Promise<CalculationResult> => {

    const queryParams = new URLSearchParams({
        Year: formData.year.toString(),
        FixedPrice: formData.directiveFixedPrice.toString(),
        HouseType: formData.houseType,
        SquareMeters: formData.squareMeters.toString(),
        WorkShiftType: formData.workShiftType,
        HeatingType: formData.heatingType,
        HasElectricCar: formData.hasElectricCar ? 'true' : 'false',
        NumberOfCars: formData.electricCarCount?.toString() || '',
        HasSauna: formData.hasSauna ? 'true' : 'false',
        SaunaHeatingFrequency: formData.saunaHeatingFrequency?.toString() || '',
        HasFireplace: formData.hasFirePlace ? 'true' : 'false',
        FireplaceFrequency: formData.firePlaceHeatingFrequency?.toString() || '',
        NumberOfResidents: formData.numberOfResidents.toString(),
        ElectricCarkWhUsagePerYear: formData.electricCarKwhUsagePerYear?.toString() || '',
        HasSolarPanel: formData.hasSolarPanels ? 'true' : 'false', 
        SolarPanel: formData.solarPanelCount?.toString() || '', 
        HasFloorHeating: formData.hasFloorHeating ? 'true' : 'false',
        FloorSquareMeters: formData.floorHeatingSquareMeters?.toString() || ''
    });

    queryParams.forEach((value, key) => {
        if (!value) {
            queryParams.delete(key);
        }
    });

    const response = await fetch(`${process.env.REACT_APP_BASE_URL}${process.env.REACT_APP_CALCULATION_PATH}?${queryParams}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    });
        console.log(queryParams.toString());
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data: CalculationResult = await response.json();
    console.log('Received data:', data);
    return data;
};

export default calculatePriceAndConsumption;