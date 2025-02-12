import React, { useEffect, useState } from "react";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartJSTooltip, Legend } from 'chart.js';
import '../styles/DirectiveCalculation.css';
import { FormDataParams, CalculationResult } from '../models/FormDataParams';
import { calculatePriceAndConsumption } from '../services/FetchDirectiveData';
import { Form, Button, Container, OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';
import { ValidateFormData, ValidationError } from '../validation/formDataValidation';
import { IoCalendarSharp } from "react-icons/io5";
import { FaCentSign } from "react-icons/fa6";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ApartmentRounded, HolidayVillageRounded, HomeRounded, CabinRounded, GridViewRounded, People, ElectricBolt, Waves, FilterHdr, OilBarrel, ElectricCar, ChargingStation, FireplaceRounded, BathroomRounded, SolarPowerRounded, Help } from "@mui/icons-material";
import  '../styles/IconStyles.css';
import { useTranslation } from 'react-i18next';
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import 'react-circular-progressbar/dist/styles.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartJSTooltip, Legend, ChartDataLabels);

const initialFormData: FormDataParams = {
    year: new Date().getFullYear(),
    directiveFixedPrice: 1,
    houseType: '',
    squareMeters: 1,
    workShiftType: '',
    hasFloorHeating: false,
    floorHeatingSquareMeters: 0,
    heatingType: '',
    hasElectricCar: false,
    electricCarCount: 0,
    electricCarKwhUsagePerYear: 0,
    hasSauna: false,
    saunaHeatingFrequency: 0,
    hasFirePlace: false,
    firePlaceHeatingFrequency: 0,
    numberOfResidents: 1,
    hasSolarPanels: false,
    solarPanelCount: 1
};

type HouseType = 'Apartmenthouse' | 'Terracedhouse' | 'Detachedhouse' | 'Cottage';
type WorkShiftType = 'DayWorker' | 'ShiftWorker' | 'RemoteWorker';
type HeatingType = 'ElectricHeating' | 'DistrictHeating' | 'GeothermalHeating' | 'OilHeating';

const ElectricityPriceForm = () => {
    
    const [formData, setFormData] = useState<FormDataParams>(initialFormData);
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
    const [showErrors, setShowErrors] = useState<boolean>(false);
    const [selectedHouseType, setSelectedHouseType] = useState<HouseType | null>(null);
    const [selectedWorkShiftType, setSelectedWorkshiftType] = useState<WorkShiftType | null>(null);
    const [selectedHeatingType, setSelectedHeatingType] = useState<HeatingType | null>(null);
    const [showSpotPrice, setShowSpotPrice] = useState(true);
    const [showFixedPrice, setShowFixedPrice] = useState(true);
    const [showConsumption, setShowConsumption] = useState(false);
    const { t } = useTranslation();
    const { i18n } = useTranslation();
    const [showProgressBar, setShowProgressBar] = useState(true);
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

    useEffect(() => {
        // Load saved state from localStorage if available
        const savedState = localStorage.getItem('electricityPriceFormState');
        if (savedState) {
            const state = JSON.parse(savedState);
            setFormData(state.formData);
            setResult(state.result);
            setCurrentStep(state.currentStep);
            setValidationErrors(state.validationErrors);
            setShowErrors(state.showErrors);
            setSelectedHouseType(state.selectedHouseType);
            setSelectedWorkshiftType(state.selectedWorkshiftType);
            setSelectedHeatingType(state.selectedHeatingType);
            setShowSpotPrice(state.showSpotPrice);
            setShowFixedPrice(state.showFixedPrice);
            setShowConsumption(state.showConsumption);
            setShowProgressBar(state.showProgressBar);
            setCurrentMonthIndex(state.currentMonthIndex);
        }
    }, []);
    useEffect(() => {
        // Save state to localStorage
        localStorage.setItem('electricityPriceFormState', JSON.stringify({
            formData,
            result,
            currentStep,
            validationErrors,
            showErrors,
            selectedHouseType,
            selectedWorkShiftType,
            selectedHeatingType,
            showSpotPrice,
            showFixedPrice,
            showConsumption,
            showProgressBar,
            currentMonthIndex
        }));
    }, [formData, result, currentStep, validationErrors, showErrors, selectedHouseType, selectedWorkShiftType, selectedHeatingType, showSpotPrice, showFixedPrice, showConsumption, showProgressBar, currentMonthIndex]);
        
    const skipFloorHeating = (heatingType: HeatingType): boolean => {
        return heatingType === 'ElectricHeating';
    };

    const skipHeatingType = (housetype: HouseType): boolean => {
        return housetype === 'Apartmenthouse';
    };

    const totalSteps = 8;
    const calculateProgressBar = (currentStep: number, totalSteps: number): number => {
        if (currentStep === totalSteps) {
            return 100;
        }
        return ((currentStep - 1) / (totalSteps - 1)) * 100;
    };
    const progress = calculateProgressBar(currentStep, totalSteps);

    const renderTooltip = (props: any) => (
        <BootstrapTooltip id="button-tooltip" {...props}>
            {t('carInfo')}
        </BootstrapTooltip>
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
    
        if (type === 'checkbox') {
            const isChecked = (e.target as HTMLInputElement).checked;
            setFormData({
                ...formData,
                [name]: isChecked
            });
        } else {
            setFormData({
                ...formData,
                [name]: type === 'number' ? parseFloat(value) : value
            });
        }
    };

    const handleHouseTypeSelect = (houseType: HouseType) => {
        if (houseType === 'Apartmenthouse' || houseType === 'Terracedhouse' || houseType === 'Detachedhouse' || houseType === 'Cottage') {
            const newHouseType = selectedHouseType === houseType ? null : houseType; 
    
            setSelectedHouseType(newHouseType);
            setShowErrors(false);
            
            setFormData({
                ...formData,
                houseType: newHouseType ? houseType.toString() : ''  
            });
        }
    };

    const handleWorkshiftTypeSelect = (workShiftType: WorkShiftType) => {
        if (workShiftType === 'DayWorker' || workShiftType === 'ShiftWorker' || workShiftType === 'RemoteWorker') {
            const newWorkShiftType = selectedWorkShiftType === workShiftType ? null : workShiftType; 
            
            setSelectedWorkshiftType(newWorkShiftType)
           
            setShowErrors(false);
            
            setFormData({
                ...formData,
                workShiftType: newWorkShiftType ? workShiftType.toString() : '' 
            });
        }
    };

    const handleHeatingTypeSelect = (heatingType: HeatingType) => {
        if (heatingType === 'ElectricHeating' || heatingType === 'DistrictHeating' || heatingType === 'GeothermalHeating' || heatingType === 'OilHeating') {
            const newHeatingType = selectedHeatingType === heatingType ? null : heatingType; 
            
            setSelectedHeatingType(newHeatingType)
           
            setShowErrors(false);
            setFormData({
                ...formData,
                heatingType: newHeatingType ? heatingType.toString() : '' 
            });
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setFormData({
           ...formData,
            workShiftType: selectedWorkShiftType? selectedWorkShiftType.toString() : '' 
        });
    
        const validationErrors = ValidateFormData(formData, currentStep, t);
        if (validationErrors.length > 0) {  
            setValidationErrors(validationErrors);
            setShowErrors(true);
            return;
        }
        else if(validationErrors.length === 0 && currentStep === 8) {
            try {
                const data = await calculatePriceAndConsumption(formData);
                setResult(data);
                setShowErrors(false);
                setShowProgressBar(false);  
            } catch (error) {
                console.error('Error:', error);
            }
        }
        else if(formData.houseType === 'AparmentHouse' || 'TerracedHouse' && currentStep === 7 && validationErrors.length === 0){
            try {
                const data = await calculatePriceAndConsumption(formData);
                setResult(data);
                setShowErrors(false);
                setShowProgressBar(false);  
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    const handleNext = () => {
        const validationErrors = ValidateFormData(formData, currentStep, t);
        if (validationErrors.length > 0) {
            setValidationErrors(validationErrors);
            setShowErrors(true);
            return;
        }
        
        
        setValidationErrors([]);
        setShowErrors(false);

        if (currentStep === 4 && skipFloorHeating(formData.heatingType as HeatingType)) {
            setCurrentStep(currentStep + 2);
        } else if (currentStep === 3 && skipHeatingType(formData.houseType as HouseType)){
            setCurrentStep(currentStep + 2);
        } else {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        let prevStep = currentStep - 1;

        if (currentStep === 6 && skipFloorHeating(formData.heatingType as HeatingType)) {
            prevStep = currentStep - 2;
        } else if (currentStep === 5 && skipHeatingType(formData.houseType as HouseType)) {
            prevStep = currentStep - 2;
        }

        setCurrentStep(prevStep);
    };

    const handleReset = () => {
        setFormData(initialFormData);
        setResult(null);
        setCurrentStep(1);
        setSelectedHouseType(null);
        setSelectedWorkshiftType(null);
        setSelectedHeatingType(null);
        setShowProgressBar(true);
    };

    const renderStep = (): React.ReactNode => {
        if (result !== null) {
            return null;
        }

        switch (currentStep) {
            case 1:
                return (
                    <>
                        {/* Initial information */}
                        <h2 style={{ textAlign: 'center' }}>{t('startingInformation')}</h2>
                        <br />
                        <div className="form-group">
                            <label className="year-label">{t('Year')}</label>
                            <div className="input-with-calendar">
                                <IoCalendarSharp style={{ height: '45px', width: '45px' }}/>
                                <input type="number" name="year" value={formData.year} onChange={handleChange} required min={2015} />
                            </div>
                            <div>
                                <span className="error-message">
                                            {validationErrors.find(error => error.field === 'year')?.message}
                                </span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="fixprice-label">{t('fixedPrice')}</label>
                            <div className="input-with-price">
                                <FaCentSign style={{ height: '45px', width: '45px' }}/>
                                <input type="number" name="directiveFixedPrice" value={formData.directiveFixedPrice} onChange={handleChange} required min={1} step={0.1}/>
                            </div>
                            <div>
                            <span className="error-message">
                                    {validationErrors.find(error => error.field === 'directiveFixedPrice')?.message}
                            </span>
                            </div>
                        </div>
                        <div className="nextPrevButtons">
                            <Button className="nextButton" variant="primary" onClick={handleNext}>{t('NextButton')}</Button>
                        </div>
                    </>
                );
            case 2:
                return (
                    <>
                        {/* Housetype */}
                        <h2 style={{ textAlign: 'center' }}>{t('houseType')}</h2>
                        <br />
                        <br />
                        <div className="form-group">
                            <div className="house-type-buttons">
                                <button
                                    className={`house-type-button ${selectedHouseType === 'Apartmenthouse' ? 'selected' : ''}`}
                                    onClick={() => handleHouseTypeSelect('Apartmenthouse')}
                                >
                                    <ApartmentRounded style={{ height: '60px', width: '60px' }}/>
                                    <p className="houseIconNames">{t('ApartmentHouse')}</p>
                                </button>
                                <button
                                    className={`house-type-button ${selectedHouseType === 'Terracedhouse' ? 'selected' : ''}`}
                                    onClick={() => handleHouseTypeSelect('Terracedhouse')}
                                >
                                    <HolidayVillageRounded style={{ height: '60px', width: '60px' }}/>
                                    <p className="houseIconNames">{t('TerracedHouse')}</p>
                                </button>
                                <button
                                    className={`house-type-button ${selectedHouseType === 'Detachedhouse' ? 'selected' : ''}`}
                                    onClick={() => handleHouseTypeSelect('Detachedhouse')}
                                >
                                    <HomeRounded style={{ height: '60px', width: '60px' }}/>
                                    <p className="houseIconNames">{t('DetachedHouse')}</p>
                                </button>
                                <button
                                    className={`house-type-button ${selectedHouseType === 'Cottage' ? 'selected' : ''}`}
                                    onClick={() => handleHouseTypeSelect('Cottage')}
                                >
                                    <CabinRounded style={{ height: '60px', width: '60px' }}/>
                                    <p className="houseIconNames">{t('Cottage')}</p>
                                </button >
                            </div>
                        </div>
                        <br />
                        <br />
                            <div style={{ textAlign: 'center'}}>
                                <span className="error-message">
                                        {validationErrors.find(error => error.field === 'houseType')?.message}
                                </span>
                            </div>
                        <div className="nextPrevButtons">
                            <Button className="prevButton" variant="secondary" onClick={handlePrevious}>{t('PreviousButton')}</Button>
                            <Button className="nextButton" variant="primary" onClick={handleNext}>{t('NextButton')}</Button>
                        </div>
                    </>
                )
            case 3:
                return (
                    <>
                        {/* Apartment Information */}
                        <h2 style={{ textAlign: 'center' }}>{t('ApartmentInformation')}</h2>
                        <br />
                        <div className="form-group">
                            <label className="sqrt-label">{t('SquareMeters')}</label>
                            <div className="input-with-sqrt">
                                <GridViewRounded style={{ height: '45px', width: '45px' }}/>
                                <input type="number" name="squareMeters" value={formData.squareMeters} onChange={handleChange} required />
                            </div>
                            <span className="error-message">
                                {validationErrors.find(error => error.field === 'squareMeters')?.message}
                            </span>
                        </div>
                        <div className="form-group">
                            <label className="resident-label">{t('NumberOfResidents')}</label>
                            <div className="input-with-resident">
                                <People style={{ height: '45px', width: '45px' }}/>
                                <input type="number" name="numberOfResidents" value={formData.numberOfResidents} onChange={handleChange} required />
                            </div>
                            {showErrors && validationErrors.some(error => error.field === 'numberOfResidents') && (
                                <span className="error-message">
                                    {validationErrors.find(error => error.field === 'numberOfResidents')?.message}
                                </span>
                            )}
                        </div>
                        <br />
                        <div className="form-group">
                              <label className="workshift-label">{t('WorkShiftType')}</label>
                            <br />
                            <div className="work-shift-buttons">
                                <button
                                    className={`work-shift-button ${formData.workShiftType === 'DayWorker' ? 'selected' : ''}`}
                                    onClick={() => handleWorkshiftTypeSelect('DayWorker')}
                                >
                                    <p className="workShiftText">{t('DayWorker')}</p>
                                </button>
                                <button
                                    className={`work-shift-button ${formData.workShiftType === 'ShiftWorker' ? 'selected' : ''}`}
                                    onClick={() => handleWorkshiftTypeSelect('ShiftWorker')}
                                >
                                    <p className="workShiftText">{t('ShiftWorker')}</p>
                                </button>
                                <button
                                    className={`work-shift-button ${formData.workShiftType === 'RemoteWorker' ? 'selected' : ''}`}
                                    onClick={() => handleWorkshiftTypeSelect('RemoteWorker')}
                                >
                                    <p className="workShiftText">{t('RemoteWorker')}</p>
                                </button>
                            </div>
                            <br />
                            <div style={{ textAlign: 'center'}}>
                            <span className="error-message">
                                    {validationErrors.find(error => error.field === 'workShiftType')?.message}
                            </span>
                            </div>
                        </div>
                        <div className="nextPrevButtons">
                            <Button className="prevButton" variant="secondary" onClick={handlePrevious}>{t('PreviousButton')}</Button>
                            <Button className="nextButton" variant="primary" onClick={handleNext}>{t('NextButton')}</Button>
                        </div>
                    </>
                );
            case 4:
                return (
                    <>
                        {/* Heating Type Information */}
                        <h2 style={{ textAlign: 'center' }}>{t('HeatingTypeInfo')}</h2>
                        <br />
                        <br />
                        <div className="form-group">
                            <div className="house-type-buttons">
                                <button
                                    className={`house-type-button ${selectedHeatingType === 'ElectricHeating' ? 'selected' : ''}`}
                                    onClick={() => handleHeatingTypeSelect('ElectricHeating')}
                                >
                                    <ElectricBolt style={{ height: '60px', width: '60px' }}/>
                                    <p className="heatingTypeIcons">{t('ElectricHeating')}</p>
                                </button>
                                <button
                                    className={`house-type-button ${selectedHeatingType === 'DistrictHeating' ? 'selected' : ''}`}
                                    onClick={() => handleHeatingTypeSelect('DistrictHeating')}
                                >
                                    <Waves style={{ height: '60px', width: '60px' }}/>
                                    <p className="heatingTypeIcons">{t('DistrictHeating')}</p>
                                </button>
                                <button
                                    className={`house-type-button ${selectedHeatingType === 'GeothermalHeating' ? 'selected' : ''}`}
                                    onClick={() => handleHeatingTypeSelect('GeothermalHeating')}
                                >
                                    <FilterHdr style={{ height: '60px', width: '60px' }}/>
                                    <p className="heatingTypeIcons">{t('GeothermalHeating')}</p>
                                </button>
                                <button
                                    className={`house-type-button ${selectedHeatingType === 'OilHeating' ? 'selected' : ''}`}
                                    onClick={() => handleHeatingTypeSelect('OilHeating')}
                                >
                                    <OilBarrel style={{ height: '60px', width: '60px' }}/>
                                    <p className="heatingTypeIcons">{t('OilHeating')}</p>
                                </button >
                            </div>
                        </div>
                        <br />
                        <br />
                            <div style={{ textAlign: 'center'}}>
                                <span className="error-message">
                                {validationErrors.find(error => error.field === 'heatingType')?.message}
                                </span>
                            </div>
                        <div className="nextPrevButtons">
                            <Button className="prevButton" variant="secondary" onClick={handlePrevious}>{t('PreviousButton')}</Button>
                            <Button className="nextButton" variant="primary" onClick={handleNext}>{t('NextButton')}</Button>
                        </div>
                    </>
                );
            case 5:
                return (
                    <>
                        {/* Floor Heating Information */}
                        <h2 style={{ textAlign: 'center' }}>{t('FloorHeating')}</h2>
                        <br />
                        <div className="form-group text-center">
                            <label>{t('HasFloorHeating')}</label>
                            <br />
                            <br />
                            <Form.Check
                                inline
                                label={t('Yes')}
                                type="radio"
                                id="floorHeatingYes"
                                name="hasFloorHeating"
                                checked={formData.hasFloorHeating}
                                onChange={() => setFormData({ ...formData, hasFloorHeating: true })}
                            />
                            <Form.Check
                                inline
                                label={t('NoI')}
                                type="radio"
                                id="floorHeatingNo"
                                name="hasFloorHeating"
                                checked={!formData.hasFloorHeating}
                                onChange={() => setFormData({ ...formData, hasFloorHeating: false })}
                            />
                        </div>
                        {formData.hasFloorHeating && (
                            <>
                            <div className="form-group">
                                <label className="sqrt-label">{t('HeatedArea')}</label>
                                <div className="input-with-sqrt">
                                    <GridViewRounded style={{ height: '45px', width: '45px' }}/>
                                    <input type="number" name="floorHeatingSquareMeters" value={formData.floorHeatingSquareMeters} onChange={handleChange} />
                                </div>
                                    <span className="error-message">
                                        {validationErrors.find(error => error.field === 'floorHeatingSquareMeters')?.message}
                                    </span>
                                </div>
                            </>
                        )}
                        <div className="nextPrevButtons">
                            <Button className="prevButton" variant="secondary" onClick={handlePrevious}>{t('PreviousButton')}</Button>
                            <Button className="nextButton" variant="primary" onClick={handleNext}>{t('NextButton')}</Button>
                        </div>
                    </>
                );
            case 6:
                return (
                    <>
                        {/* Electric Car Information */}
                        <h2 style={{ textAlign: 'center' }}>{t('ElectricCar')}</h2>
                        <br />
                        <div className="form-group text-center">
                            <label>{t('ElectricCarInfo')}</label>
                            <br />
                            <br />
                            <Form.Check
                                inline
                                label={t('Yes')}
                                type="radio"
                                id="electricCarYes"
                                name="hasElectricCar"
                                checked={formData.hasElectricCar}
                                onChange={() => setFormData({ ...formData, hasElectricCar: true })}
                            />
                            <Form.Check
                                inline
                                label={t('No')}
                                type="radio"
                                id="electrciCarNo"
                                name="hasElectricCar"
                                checked={!formData.hasElectricCar}
                                onChange={() => setFormData({ ...formData, hasElectricCar: false })}
                            />
                        </div>
                        {formData.hasElectricCar && (
                            <>
                                <div className="form-group">
                                    <label className="cars-label">{t('NumberOfElectricCars')}</label>
                                    <div className="input-with-cars">
                                        <ElectricCar style={{ height: '45px', width: '45px' }}/>
                                        <input type="number" name="electricCarCount" value={formData.electricCarCount} onChange={handleChange} />
                                    </div>     
                                        <span className="error-message">
                                            {validationErrors.find(error => error.field === 'electricCarCount')?.message}
                                        </span>
                                </div>
                                <div className="form-group">
                                    <label className="kwh-label">{t('ElectricCarUsage')}</label>
                                    <div className="input-with-kwh">
                                        <ChargingStation style={{ height: '45px', width: '45px' }}/>
                                        <input type="number" name="electricCarKwhUsagePerYear" value={formData.electricCarKwhUsagePerYear} onChange={handleChange} />
                                        <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={renderTooltip}>
                                            <Help style={{ height: '35px', width: '35px'}} />
                                        </OverlayTrigger>
                                    </div>
                                    {showErrors && validationErrors.some(error => error.field === 'electricCarKwhUsagePerYear') && (
                                        <span className="error-message">
                                            {validationErrors.find(error => error.field === 'electricCarKwhUsagePerYear')?.message}
                                        </span>
                                    )}
                                </div>
                            </>
                        )}
                        <div className="nextPrevButtons">
                            <Button className="prevButton" variant="secondary" onClick={handlePrevious}>{t('PreviousButton')}</Button>
                            <Button className="nextButton" variant="primary" onClick={handleNext}>{t('NextButton')}</Button>
                        </div>
                    </>
                );
            case 7:
                return (
                    <>
                    {/* Other Expenses */}
                    <h2 style={{ textAlign: 'center' }}>{t('OtherExpenses')}</h2>
                    <br />
                    <div className="form-group text-center">
                        <label>{t('ElectricSauna')}</label>
                        <br />
                        <br />  
                        <Form.Check
                            inline
                            label={t('Yes')}
                            type="radio"
                            id="saunaYes"
                            name="hasSauna"
                            checked={formData.hasSauna}
                            onChange={() => setFormData({ ...formData, hasSauna: true })}
                        />
                        <Form.Check
                            inline
                            label={t('NoI')}
                            type="radio"
                            id="saunaNo"
                            name="hasSauna"
                            checked={!formData.hasSauna}
                            onChange={() => setFormData({ ...formData, hasSauna: false })}
                        />
                    </div>
                    {formData.hasSauna && (
                        <div className="form-group">
                        <label className="sauna-label">{t('ElectricSaunaUsage')}</label>
                        <div className="input-with-sauna">
                            <BathroomRounded style={{ height: '45px', width: '45px' }}/>
                            <input type="number" name="saunaHeatingFrequency" value={formData.saunaHeatingFrequency} onChange={handleChange} />
                        </div>
                            <span className="error-message">
                                {validationErrors.find(error => error.field === 'saunaHeatingFrequency')?.message}
                            </span>
                        </div>
                    )}
                    {(formData.houseType === 'Detachedhouse' || formData.houseType === 'Cottage') && (
                        <>
                        <div className="form-group text-center">
                            <label>{t('HasFirePlace')}</label>
                            <br />
                            <br />
                            <Form.Check
                            inline
                            label={t('Yes')}
                            type="radio"
                            id="fireplaceYes"
                            name="hasFirePlace"
                            checked={formData.hasFirePlace}
                            onChange={() => setFormData({ ...formData, hasFirePlace: true })}
                        />
                        <Form.Check
                            inline
                            label={t('NoI')}
                            type="radio"
                            id="fireplaceNo"
                            name="hasFirePlace"
                            checked={!formData.hasFirePlace}
                            onChange={() => setFormData({ ...formData, hasFirePlace: false })}
                        />
                        </div>
                        {formData.hasFirePlace && (
                            <div className="form-group">
                                <label className="fireplace-label">{t('FirePlaceUsage')}</label>
                            <div className="input-with-fireplace">
                                <FireplaceRounded style={{ height: '45px', width: '45px' }}/>
                                <input type="number" name="firePlaceHeatingFrequency" value={formData.firePlaceHeatingFrequency} onChange={handleChange} />
                            </div>   
                                <span className="error-message">
                                    {validationErrors.find(error => error.field === 'firePlaceHeatingFrequency')?.message}
                                </span>
                            </div>
                        )}
                        </>
                    )}
                    {formData.houseType === 'Apartmenthouse' || formData.houseType === 'Terracedhouse'? (
                        <div className="nextPrevButtons">
                            <Button className="prevButton" variant="secondary" onClick={handlePrevious}>{t('PreviousButton')}</Button>
                            <Button variant="primary" className="calcResultBtn" onClick={handleSubmit}>{t('CalculateResultsButton')}</Button>
                        </div>
                    ) : (
                        <>
                        <div className="nextPrevButtons">
                            <Button className="prevButton" variant="secondary" onClick={handlePrevious}>{t('PreviousButton')}</Button>
                            <Button className="nextButton" variant="primary" onClick={handleNext}>{t('NextButton')}</Button>
                        </div>
                        </>
                    )}
                    </>
                );
                case 8:
                    if (formData.houseType === 'Detachedhouse' || formData.houseType === 'Cottage') {
                        return (
                            <>
                                {/* Solar Panel Information*/}
                                <h2 style={{ textAlign: 'center' }}>{t('SolarPanelHeader')}</h2>
                                <br />
                                <div className="form-group text-center">
                                    <label>{t('SolarPanels')}</label>
                                    <br />
                                    <br />
                                    <Form.Check
                                        inline
                                        label={t('Yes')}
                                        type="radio"
                                        id="solapanelYes"
                                        name="hasSolarPanels"
                                        checked={formData.hasSolarPanels}
                                        onChange={() => setFormData({ ...formData, hasSolarPanels: true })}
                                    />
                                    <Form.Check
                                        inline
                                        label={t('NoI')}
                                        type="radio"
                                        id="solarpanelNo"
                                        name="hasSolarPanels"
                                        checked={!formData.hasSolarPanels}
                                        onChange={() => setFormData({ ...formData, hasSolarPanels: false })}
                                    />
                                </div>
                                {formData.hasSolarPanels && (
                                    <div className="form-group">
                                        <label className="solarpanel-label">{t('SolarPanelCount')}</label>
                                        <div className="input-with-solarpanel">
                                            <SolarPowerRounded style={{ height: '45px', width: '45px' }}/>
                                            <input type="number" name="solarPanelCount" value={formData.solarPanelCount} onChange={handleChange} />
                                        </div>
                                        <div>
                                            <span className="error-message">
                                                {validationErrors.find(error => error.field === 'solarPanelCount')?.message}
                                            </span>
                                        </div>
                                        
                                    </div>
                                )}
                                <div className="nextPrevButtons">
                                <Button className="prevButton" variant="secondary" onClick={handlePrevious}>{t('PreviousButton')}</Button>
                                <Button variant="primary" className="calcResultBtn" onClick={handleSubmit}>{t('CalculateResultsButton')}</Button>
                                </div>
                            </>
                        );
                    } else {
                        setCurrentStep(currentStep + 1); 
                        return null;
                    }
                default:
                    return null;
            }
        };
        

        const renderChart = (): React.ReactNode => {
            if (!result || !Array.isArray(result.MonthlyData) || result.MonthlyData.length === 0) {
                return <p>Ei kuukausidataa saatavilla.</p>;
            }
        
            const maxItems = isMobile() ? 6 : 12;
            const startIndex = isMobile() ? currentMonthIndex : 0;
            const endIndex = startIndex + maxItems;
            const filteredData = result.MonthlyData.slice(startIndex, endIndex);
        
            const labels = filteredData.map((month, index) => {
                let monthName;
                if (i18n.language === 'en') {
                    monthName = new Date(0, month.Month - 1).toLocaleString('en-US', { month: 'long' });
                } else if (i18n.language === 'fi') {
                    monthName = new Date(0, month.Month - 1).toLocaleString('fi-FI', { month: 'long' });
                }
                
                if (monthName) {
                    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
                } else {
                    return ''; 
                }
            });
        
            const consumptionData = filteredData.map((month) => month.Consumption);
            const spotPriceData = filteredData.map((month) => month.SpotPriceTotal);
            const fixedPriceData = filteredData.map((month) => month.FixedPriceTotal);
        
            const chartData = {
                labels: labels,
                datasets: [
                    ...(showSpotPrice ? [{
                        label: t('showSpotPrice'),
                        backgroundColor: '#4682B4',
                        data: spotPriceData,
                    }] : []),
                    ...(showFixedPrice ? [{
                        label: t('showFixedPrice'),
                        backgroundColor: '#DC143C',
                        data: fixedPriceData,
                    }] : []),
                    ...(showConsumption ? [{
                        label: t('showConsumption'),
                        backgroundColor: '#32CD32',
                        data: consumptionData,
                        datalabels: {
                            color: '#333',
                        },
                    }] : []),
                ],
                datalabels: {
                    labels,
                },
            };
        
            return (
                <div className="chart-container">
                    <h2 style={{ textAlign: 'center' }}>{t('MonthlyResults')}</h2>
                    <Bar
                        data={chartData}
                        options={{
                            plugins: {
                                legend: {
                                    position: 'top' as const,
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            let label = context.dataset.label || '';
                                            if (label) {
                                                label += ': ';
                                            }
                                            if (context.dataset.label === 'Kulutus') {
                                                label += context.raw + ' kWh';
                                            } else {
                                                label += context.raw + ' €';
                                            }
                                            return label;
                                        }
                                    }
                                },
                                datalabels: {
                                    display: false,
                                },
                            },
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                x: {
                                    title: {
                                        display: true,
                                    },
                                    grid: {
                                        display: false,
                                    },
                                },
                                y: {
                                    title: {
                                        display: true,
                                        text: 'Hinta (€ ) / Kulutus kWh',
                                        font: {
                                            size: 14,
                                            weight: 'bold',
                                        }
                                    },
                                    grid: {
                                        color: '#ddd',
                                    },
                                },
                            }
                        }}
                    />
                </div>
            );
        };
        const isMobile = (() => {
  
            const userAgent = navigator.userAgent || navigator.vendor;
            const mobileUserAgents = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
          
            const isMobileDevice = mobileUserAgents.some(mobileAgent => userAgent.toLowerCase().includes(mobileAgent));
            const isMobileScreen = window.innerWidth <= 768;
            const isMobile = isMobileDevice || isMobileScreen;

            return isMobile;
          })
          
        const handlePrevMonthPeriod = () => {
            const step = isMobile() ? 6 : 15
            if (isMobile()) {
                // Handle mobile month navigation
                if (result?.MonthlyData && currentMonthIndex - step >= 0) {
                    setCurrentMonthIndex(currentMonthIndex - step);
                }
            } else {
                // Handle regular month navigation
                if (result?.MonthlyData && currentMonthIndex - step >= 0) {
                    setCurrentMonthIndex(currentMonthIndex - step);
                }
            }
        };
        const handleNextMonthPeriod = () => {
            const step = isMobile() ? 6 : 15;
            if (isMobile()) {
                // Handle mobile month navigation
                if (result?.MonthlyData && currentMonthIndex + step < result.MonthlyData.length) {
                    setCurrentMonthIndex(currentMonthIndex + step);
                }
            } else {
                // Handle regular month navigation
                if (result?.MonthlyData && currentMonthIndex + step < result?.MonthlyData.length) {
                    setCurrentMonthIndex(currentMonthIndex + step);
                }
            }
        };
        const maxItems = isMobile() ? 6 : 15; // Limit to 6 for mobile, 15 otherwise
        let months = result?.MonthlyData.filter(data => isMobile() ? true : data.Month === currentMonthIndex);
          
        if (isMobile()) {
            months = months?.slice(currentMonthIndex, currentMonthIndex + maxItems);
            ;
        } else {
            months = months?.slice(0, maxItems);
            
        }
        return (
            <Container className="form-container">
                <h1 style={{ textAlign: 'center', fontFamily: 'Montserrat, sans-serif' }}>{t('MainHeader')}</h1>
                <br />
                <Form onSubmit={handleSubmit}>
                    {renderStep()}
                    <br />
                    {showProgressBar && (
                        <div className="progress-bar-container">
                            <CircularProgressbar
                                value={calculateProgressBar(currentStep, totalSteps)}
                                text={`${Math.round(calculateProgressBar(currentStep, totalSteps))}%`}
                                styles={buildStyles({
                                    pathColor: '#808080',
                                    textColor: 'black',
                                    trailColor: '#FFFFFF',
                                    textSize: '20px',
                                    pathTransitionDuration: 0.5,
                                })}
                                strokeWidth={15}
                            />
                        </div>
                    )}
                </Form>
                {result && (
                    <>
                        <div className="result-data-container">
                            <div className="result-data-summary">
                                <h3>{t('results')}</h3>
                                <p>{t('resultDescription')} <b>{result.CalculationYears}</b></p>
                                <p>{t('cheaperOptionDescription')} <b>{result.CheaperOption === 'Spot price' ? t('spotElectricity') : t('fixedElectricity') + ''}</b></p>
                                <p className="price-difference">{t('averagepriceDifference')} {result.CostDifference}€</p>
                            </div>
                            <div className="result-data-keywords">
                                <p>{t('directiveConsumption')} <span className="dynamic-value">{result.EstimatedMinConsumption} - {result.EstimatedMaxConsumption}</span> kWh</p>
                                <p>{t('spotElectricityPrice')} <span className="dynamic-value">{result.MinSpotPriceCost} - {result.MaxSpotPriceCost}</span> €</p>
                                <p>{t('fixedElectricityPrice')} <span className="dynamic-value">{result.MinFixedPriceCost} - {result.MaxFixedPriceCost}</span> €</p>
                                <p>{t('estimatedAverageHourlySpotPrice')} <span className="dynamic-value">{result.AverageHourlySpotPrice}</span> c/kWh</p>
                            </div>
                        </div>
                        <div className="graph-options">
                            <Form.Check
                                type="checkbox"
                                label={t('showSpotPrice')}
                                checked={showSpotPrice}
                                onChange={() => setShowSpotPrice(!showSpotPrice)}
                                className="form-check"
                            />
                            <Form.Check
                                type="checkbox"
                                label={t('showFixedPrice')}
                                checked={showFixedPrice}
                                onChange={() => setShowFixedPrice(!showFixedPrice)}
                                className="form-check"
                            />
                            <Form.Check
                                type="checkbox"
                                label={t('showConsumption')}
                                checked={showConsumption}
                                onChange={() => setShowConsumption(!showConsumption)}
                                className="form-check"
                            />
                        </div>
                        <div className="chart-controls">
                        {isMobile() && (
                            <div className="month-period-controls">
                                <Button
                                    onClick={handlePrevMonthPeriod}
                                    disabled={currentMonthIndex === 0}
                                >
                                    {t('previous')}
                                </Button>
                                <Button
                                    onClick={handleNextMonthPeriod}
                                    disabled={currentMonthIndex + (isMobile() ? 6 : 15) >= (result?.MonthlyData?.length || 0)}
                                >
                                    {t('next')}
                                </Button>
                            </div>
                            
                        )}
                        </div>
                        <br />
                        {renderChart()}
                        <div className="calculate-again">
                            <Button className="calcAgain" variant="primary" onClick={handleReset}>{t('calculateAgain')}</Button>
                        </div>
                    </>
                )}
            </Container>
        );
    };

export default ElectricityPriceForm;