import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, OverlayTrigger } from 'react-bootstrap';
import { FetchDataService } from '../services/FetchDataService';
import DataParams from '../models/DataParams';
import '../styles/FinGridCalculation.css';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Lottie from 'lottie-react';
import animationData from './loadingAnimation.json';
import { useTranslation } from 'react-i18next';
import { parse, format, isValid } from 'date-fns';
import { Tooltip as BootstrapTooltip } from 'react-bootstrap';
import { Help } from '@mui/icons-material';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const FilterForm = () => {
  const { t } = useTranslation();
  const [fixedPrice, setFixedPrice] = useState<number | ''>(10);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [marginal, setMarginal] = useState<number>(0.00);
  const [resultData, setResultData] = useState<DataParams | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('month'); // Default to month
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [showSpotPrice, setShowSpotPrice] = useState(true);
  const [showFixedPrice, setShowFixedPrice] = useState(true);
  const [showConsumption, setShowConsumption] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  
  useEffect(() => {
    // Load saved state from localStorage if available
    const savedState = localStorage.getItem('filterFormState');
    if (savedState) {
      const state = JSON.parse(savedState);
      setFixedPrice(state.fixedPrice);
      setCsvFile(state.csvFile ? new File([state.csvFile], state.csvFile.name) : null);
      setResultData(state.resultData);
      setError(state.error);
      setTimePeriod(state.timePeriod);
      setCurrentDayIndex(state.currentDayIndex);
      setCurrentWeekIndex(state.currentWeekIndex);
      setCurrentYear(state.currentYear);
      setShowSpotPrice(state.showSpotPrice);
      setShowFixedPrice(state.showFixedPrice);
      setShowConsumption(state.showConsumption);
      setCurrentMonthIndex(state.currentMonthIndex);
    }
  }, []);

  useEffect(() => {
    // Save state to localStorage whenever it changes
    localStorage.setItem('filterFormState', JSON.stringify({
      fixedPrice,
      marginal,
      csvFile,
      resultData,
      error,
      timePeriod,
      currentDayIndex,
      currentWeekIndex,
      currentYear,
      showSpotPrice,
      showFixedPrice,
      showConsumption,
      currentMonthIndex,
    }));
  }, [fixedPrice, marginal, csvFile, resultData, error, timePeriod, currentDayIndex, currentWeekIndex, currentYear, showSpotPrice, showFixedPrice, showConsumption]);

  const renderTooltip = (props: any) => (
    <BootstrapTooltip id="button-tooltip" {...props}>
        {t('OptimizeInfo')}
    </BootstrapTooltip>
  );   
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultData(null); 
    setError(null);
  
    if (fixedPrice !== '' && csvFile) {
      setLoading(true);
      const params: DataParams = {
        
        fixedPrice: Number(fixedPrice),
        csvFile,
        ...(marginal !== 0.00 && {marginal})
      }
 
      try {
        const data = await FetchDataService(params);
        setResultData(data);
        setError(null);
        setCurrentDayIndex(0);
        setCurrentWeekIndex(0);
        setCurrentMonthIndex(0);
  
        if (data.MonthlyData) {
          const sortedMonthlyData = data.MonthlyData.sort((a, b) => a.Year - b.Year);
          setCurrentYear(sortedMonthlyData[0].Year);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again.');
        setResultData(null);
      } finally {
        setLoading(false); 
      }
    } else {
      alert('Please fill in the required fields.');
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCsvFile(e.target.files[0]);
    }
  };

  const handleTimePeriodChange = (period: 'day' | 'week' | 'month') => {
    setTimePeriod(period);
    setCurrentDayIndex(0);
    setCurrentWeekIndex(0);
    setCurrentMonthIndex(0);
    const firstyear = new Date().getFullYear() - 1;
    setCurrentYear(firstyear);
  };

 const formatDate = (dateString: string) => {
  const parsedDate = parse(dateString, 'dd.MM.yyyy', new Date());

  if (!isValid(parsedDate)) {
    return 'Invalid Date';
  }

  return format(parsedDate, 'MM/dd/yyyy');
};

  const formatStartDateEndDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const isMobile = (() => {
  
  const userAgent = navigator.userAgent || navigator.vendor;
  const mobileUserAgents = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];

  const isMobileDevice = mobileUserAgents.some(mobileAgent => userAgent.toLowerCase().includes(mobileAgent));
  const isMobileScreen = window.innerWidth <= 768;
  const isMobile = isMobileDevice || isMobileScreen;

  return isMobile;
})

const getGraphData = () => {
  if (!resultData) return { labels: [], datasets: [] };

  let labels: string[] = [];
  let spotPrices: number[] = [];
  let fixedPrices: number[] = [];
  let consumptions: number[] = [];

  const maxItems = isMobile() ? 6 : 15; // Limit to 6 for mobile, 15 otherwise

  if (timePeriod === 'day' && resultData.DailyData) {
    const days = resultData.DailyData.slice(currentDayIndex, currentDayIndex + maxItems);
    labels = days.map(data => `${formatDate(data.Day)}`);
    spotPrices = days.map(data => parseFloat(data.SpotPrice.toFixed(2))); 
    fixedPrices = days.map(data => parseFloat(data.FixedPrice.toFixed(2)));
    consumptions = days.map(data => data.Consumption);
  } else if (timePeriod === 'week' && resultData.WeeklyData) {
    const weeks = resultData.WeeklyData.slice(currentWeekIndex, currentWeekIndex + maxItems);
    labels = weeks.map(data => `Vk ${data.Week}, ${data.Year}`);
    spotPrices = weeks.map(data => parseFloat(data.SpotPrice.toFixed(2))); 
    fixedPrices = weeks.map(data => parseFloat(data.FixedPrice.toFixed(2)));
    consumptions = weeks.map(data => data.Consumption);
  } else if (timePeriod === 'month' && resultData.MonthlyData) {
    let months = resultData.MonthlyData
    .filter(data => isMobile() ? true : data.Year === currentYear) // Handle year filter only if not mobile
    .sort((a, b) => a.Year - b.Year); // Sort by year

if (isMobile()) {
    // Determine the maximum number of items to display
    const isYearEnd = currentMonthIndex >= months.length - 1; // Check if we are at the last month
    if (isYearEnd) {
        // If we are at the end of the year, only show January of the next year
        const nextYear = currentYear + 1;
        const nextMonthData = resultData.MonthlyData.find(data => data.Year === nextYear && data.Month === 1);
        months = nextMonthData ? [nextMonthData] : []; // Set months to only include January of the next year
    } else {
        months = months.slice(currentMonthIndex, currentMonthIndex + maxItems);
    }
} else {
    months = months.slice(0, maxItems);
}

labels = months.map(data => `${data.Month}/${data.Year}`);
spotPrices = months.map(data => parseFloat(data.SpotPrice.toFixed(2)));
fixedPrices = months.map(data => parseFloat(data.FixedPrice.toFixed(2)));
consumptions = months.map(data => data.Consumption);
}

  const datasets: any[] = [];
  if (showSpotPrice) {
      datasets.push({
          label: t('ChartSpotPrice'),
          backgroundColor: '#4682B4',
          data: spotPrices
      });
  }
  if (showFixedPrice) {
      datasets.push({
          label: t('fixedPrice'),
          backgroundColor: '#DC143C',
          data: fixedPrices
      });
  }
  if (showConsumption) {
      datasets.push({
          label: t('consumption'),
          backgroundColor: '#32CD32',
          data: consumptions,
          datalabels: {
              display: false,
              color: '#333',
          },
      });
  }

  return {
      labels,
      datasets,
  };
};


const handleNextDayPeriod = () => {
  const step = isMobile() ? 6 : 15;
  if (resultData?.DailyData) {
    const maxIndex = resultData.DailyData.length - step;
 
    if (currentDayIndex < maxIndex) {
      setCurrentDayIndex(prevIndex => Math.min(prevIndex + step, maxIndex));
    }
  }
};

const handlePrevDayPeriod = () => {
  const step = isMobile() ? 6 : 15;
  if (resultData?.DailyData) {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(prevIndex => Math.max(prevIndex - step, 0));
    }
  }
};

const handleNextWeekPeriod = () => {
  const step = isMobile() ? 6 : 15;
  if (resultData?.WeeklyData) {
    const maxIndex = resultData.WeeklyData.length - step;
    if (currentWeekIndex < maxIndex) {
      setCurrentWeekIndex(prevIndex => Math.min(prevIndex + step, maxIndex));
    }
  }
};

const handlePrevWeekPeriod = () => {
  const step = isMobile() ? 6 : 15;
  if (resultData?.WeeklyData) {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(prevIndex => Math.max(prevIndex - step, 0));
    }
  }
};

const handleNextMonthPeriod = () => {
  const step = isMobile() ? 6 : 15;
  if (resultData?.MonthlyData) {
      const maxIndex = resultData.MonthlyData.length - 1;

      if (currentMonthIndex >= maxIndex) {
          // If we're at the last index, reset to show January of the next year
          const nextYear = currentYear + 1;
          const nextMonthData = resultData.MonthlyData.find(data => data.Year === nextYear && data.Month === 1);

          if (nextMonthData) {
              // Update to show January of the next year
              setCurrentMonthIndex(0); // Reset the index to the first month (January)
              setCurrentYear(nextYear); // Update the current year
          }
      } else {
          // Regular month navigation
          if (currentMonthIndex < maxIndex) {
              setCurrentMonthIndex(prevIndex => Math.min(prevIndex + step, maxIndex));
          }
      }
  }
};



const handlePrevMonthPeriod = () => {
  const step = isMobile() ? 6 : 15;
  if (resultData?.MonthlyData) {
    if (currentMonthIndex > 0) {
      setCurrentMonthIndex(prevIndex => Math.max(prevIndex - step, 0));
    }
  }
};


const getNextYearAvailable = () => {
  if (isMobile()) {
      return false; // No year transition needed for mobile monthly view
  }
  return resultData?.MonthlyData?.some(data => data.Year === currentYear + 1) ?? false;
};

const getPrevYearAvailable = () => {
  if (isMobile()) {
      return false; // No year transition needed for mobile monthly view
  }
  return resultData?.MonthlyData?.some(data => data.Year === currentYear - 1) ?? false;
};



  
  return (
    <Container className="filter-form-container">
      <div className="section">
        <h3>{t('compareElectricityPrice')}</h3>
        <br />
        <div className="intro-text">
          <p>{t('introText1')}</p>
          <p>
            {t('introText2')}{' '}
            <a href="#" onClick={(event) => {
              event.preventDefault();
              window.open("https://oma.datahub.fi/#/login?returnUrl=%2F", "_blank");
            }}>
              {t('Fingridcustomerportal')}
            </a>
            . <b>{t('readInstructions')} </b>
            <a href='instructions'>{t('here')}</a>
          </p>
          <p>{t('setFixedPrice')} <b>snt/kwh.</b></p>
          <p>{t('uploadAndViewResults')}<b>{t('uploadAndViewResultsBold')}</b></p>
        </div>
      </div>
      <Form onSubmit={handleSubmit}>
  <Row>
    <Col xs={12} md={6} className="mb-3">
      <Form.Group controlId="fixedPrice">
        <Form.Label>{t('enterFixedPrice')}{t('unit')}</Form.Label>
        <Form.Control
          type="number"
          placeholder={t('enterFixedPrice')}
          value={fixedPrice}
          onChange={(e) => setFixedPrice(parseFloat(e.target.value) || '')}
        />
      </Form.Group>
    </Col>
    <Col xs={12} md={6} className="mb-3">
      <Form.Group controlId="csvFile">
        <Form.Label>{t('csvFile')}:</Form.Label>
        <Form.Control
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
      </Form.Group>
    </Col>
    <Col xs={12} md={6} className="mb-3">
      <Form.Group controlId="marginal">
        <Form.Label>{t('enterMarginal')}{t('unit')}</Form.Label>
        <Form.Control
          type="number"
          step="0.01"
          placeholder={t('enterMarginal')}
          value={marginal}
          onChange={(e) => setMarginal(parseFloat(e.target.value) || 0.00)}
        />
      </Form.Group>
    </Col>
    <Col xs={12} className="mb-3">
      <Button variant="primary" type="submit" className="submit-button">
        {t('submit')}
      </Button>
    </Col>
  </Row>
</Form>
      {loading && (
        <div className="loading-animation-container">
          <div className="loading-animation">
            <Lottie animationData={animationData} loop={true} />
          </div>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {resultData && (
  <>
    <div className="result-data-container">
      <div className="result-data-summary">
        <h3>{t('results')}</h3>
        <p>
          {t('timeperiodinfo')} <br></br> 
          <b>
            {resultData.StartDate ? formatStartDateEndDate(resultData.StartDate) : 'N/A'} - 
            {resultData.EndDate ? formatStartDateEndDate(resultData.EndDate) : 'N/A'}
          </b>
        </p>
        <p>
          {t('cheaperOption')}<b> {resultData.CheaperOption === 'SpotPrice' ? t('spotElectricity') : t('fixedElectricity')}</b>
        </p>
        {resultData.CheaperOption === 'SpotPrice' && (
          <p><b>{t('equilevantFixedPriceBold')}</b>{t('equilevantFixedPrice')}<b> {resultData.EquivalentFixedPrice?.toFixed(2)} {t('unit')} </b> </p>
        )}
        <p className="price-difference">
          {t('priceDifference')} <b>{resultData.PriceDifference?.toFixed(2) ?? 'N/A'} €</b>
          
        </p>
        <p className="price-difference">
          {t('optimizedPriceDifference')} <b>{resultData.OptimizedPriceDifference?.toFixed(2) ?? 'N/A'} €</b>
        </p>
        <OverlayTrigger placement="right" delay={{ show: 250, hide: 400 }} overlay={renderTooltip}>
                                            <Help style={{ height: '35px', width: '35px'}} />
                                        </OverlayTrigger>
      </div>
      <div className="result-data-keywords">
        <p>{t('totalConsumption')}: <span className="dynamic-value">{resultData.TotalConsumption?.toFixed(2) ?? 'N/A'}</span> kWh</p>
        <p>{t('spotElectricityPrice')} <span className="dynamic-value">{resultData.TotalSpotPrice?.toFixed(2) ?? 'N/A'}</span> €</p>
        <p>{t('fixedElectricityPrice')} <span className="dynamic-value">{resultData.TotalFixedPrice?.toFixed(2) ?? 'N/A'}</span> €</p>
        <p>{t('time')}: <span className="dynamic-value">{resultData.StartDate ? formatStartDateEndDate(resultData.StartDate) : 'N/A'} - {resultData.EndDate ? formatStartDateEndDate(resultData.EndDate) : 'N/A'}</span></p>
        <p>{t('optimizedSpotElectricityPrice')} <span className="dynamic-value">{resultData.TotalOptimizedSpotPrice?.toFixed(2) ?? 'N/A'}</span> €</p>

      </div>
    </div>
  </>
)}
      
      {resultData && (
        <>
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
  {timePeriod === 'day' && (
    <div className="day-period-controls">
      <Button onClick={handlePrevDayPeriod} disabled={currentDayIndex === 0}>
        {t('previous')}
      </Button>
      <Button onClick={handleNextDayPeriod} disabled={currentDayIndex + (isMobile() ? 6 : 15) >= (resultData.DailyData?.length || 0)}>
        {t('next')}
      </Button>
    </div>
  )}
  {timePeriod === 'week' && (
    <div className="week-period-controls">
      <Button onClick={handlePrevWeekPeriod} disabled={currentWeekIndex === 0}>
        {t('previous')}
      </Button>
      <Button onClick={handleNextWeekPeriod} disabled={currentWeekIndex + (isMobile() ? 6 : 15) >= (resultData.WeeklyData?.length || 0)}>
        {t('next')}
      </Button>
    </div>
  )}
  {timePeriod === 'month' && (
    <div className="month-period-controls">
      {isMobile() && (
        <>
          <Button
            onClick={handlePrevMonthPeriod}
            disabled={currentMonthIndex === 0}
        >
            {t('previous')}
        </Button>
        <Button
            onClick={handleNextMonthPeriod}
            disabled={currentMonthIndex + (isMobile() ? 6 : 15) >= (resultData?.MonthlyData?.length || 0)}
        >
            {t('next')}
        </Button>
        </>
      )}
        
        {!isMobile() && (
                <>
                    <Button 
                        onClick={() => setCurrentYear(currentYear - 1)}
                        disabled={!getPrevYearAvailable()}
                    >
                        {t('previousYear')}
                    </Button>
                    <Button
                        onClick={() => setCurrentYear(currentYear + 1)}
                        disabled={!getNextYearAvailable()}
                    >
                        {t('nextYear')}
                    </Button>
                </>
            )}
    </div>
)}
</div>
          <div className="chart-container">
            <Bar
              data={getGraphData()}
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
                      text: timePeriod === 'month'  ? t('ChartMonth') : t('ChartTime'),
                    },
                    grid: {
                      display: false,
                    },
                    
                  },
                  y: {
                    title: {
                      display: true,
                      text: t('Price/Consumption'),
                      font: {
                        size: 14,
                        weight: 'bold',
                    }
                      
                    },
                    grid: {
                      color: '#ddd',
                    },
                    
                  },
                },
              }}
            />
          </div>
          <div className="filter-options">
  <Button
    onClick={() => handleTimePeriodChange('month')}
    className={timePeriod === 'month' ? 'btn selected' : 'btn'}
  >
    {t('month')}
  </Button>
  <Button
    onClick={() => handleTimePeriodChange('week')}
    className={timePeriod === 'week' ? 'btn selected' : 'btn'}
  >
    {t('week')}
  </Button>
  <Button
    onClick={() => handleTimePeriodChange('day')}
    className={timePeriod === 'day' ? 'btn selected' : 'btn'}
  >
    {t('day')}
  </Button>
</div>
        </>
      )}
    </Container>
  );
};

export default FilterForm;