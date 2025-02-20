import {  Container,  Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { DefaultPrices } from '../services/FetchElectricityPrices';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import animationData from "./loadingAnimation.json";
import '../styles/Chart.css';

interface Price {
  date: string;
  value: number;
}

export default function PricesChart(){

    const { t } = useTranslation();
    const [prices, setPrices] = useState<Price[]>([]);
    const [timePeriod, setTimePeriod] = useState<"today" | "week" | "month">("today")
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
      const storedData = sessionStorage.getItem(`${timePeriod}Data`);
      if(storedData){
        setPrices(JSON.parse(storedData));
      }
      else{
        TuoJaFormatoiData();
      }
    },[timePeriod])
    
    const isMobile = (() => {
  
      const userAgent = navigator.userAgent || navigator.vendor;
      const mobileUserAgents = ['android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
    
      const isMobileDevice = mobileUserAgents.some(mobileAgent => userAgent.toLowerCase().includes(mobileAgent));
      const isMobileScreen = window.innerWidth <= 768;
      const isMobile = isMobileDevice || isMobileScreen;
    
      return isMobile;
    })

    async function TuoJaFormatoiData(){

      setLoading(true);
      const data: Price[] = await DefaultPrices(timePeriod);
      let formattedData: Price[] = [];
      const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      switch (timePeriod) {
        case "today":
      
          formattedData = sortedData.map((item) => ({
            ...item,
            date: new Date(item.date).toLocaleTimeString("fi-FI", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          break;

          case "week":
            const dictionary: Record<string, { total: number; count: number }> = {};
          
            sortedData.forEach(item => {
              const dateObj = new Date(item.date);
              const formattedDate = `${dateObj.getDate()}.${dateObj.getMonth() + 1}.${dateObj.getFullYear()}`; // Format as "DD.MM.YYYY"
          
              if (!dictionary[formattedDate]) {
                dictionary[formattedDate] = { total: 0, count: 0 };
              }
          
              dictionary[formattedDate].total += item.value;
              dictionary[formattedDate].count += 1;
            });

            formattedData = Object.keys(dictionary).map(date => ({
              date,
              value: Number((dictionary[date].total / dictionary[date].count).toFixed(2)), // Compute average
            }));
            formattedData.sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
            break;
          
        
          case "month": 
            const monthlyDictionary: Record<string, { total: number; count: number }> = {};
          
            sortedData.forEach(item => {
              const dateObj = new Date(item.date);
              const yearMonth = `${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`; // "YYYY-MM"
          
              if (!monthlyDictionary[yearMonth]) {
                monthlyDictionary[yearMonth] = { total: 0, count: 0 };
              }
          
              monthlyDictionary[yearMonth].total += item.value;
              monthlyDictionary[yearMonth].count += 1;
            });
          
            formattedData = Object.keys(monthlyDictionary).map(month => {
              const [year, monthNumber] = month.split("-");
              return {
                date: `${Number(monthNumber)}.${year}`, // Format as "MM.YYYY"
                value: Number((monthlyDictionary[month].total / monthlyDictionary[month].count).toFixed(2)) // Compute average
              };
            });
            formattedData.sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
          break;
          
        default:
          break;
      }
      sessionStorage.setItem(`${timePeriod}Data`, JSON.stringify(formattedData));
      setLoading(false);
      setPrices(formattedData);
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false, 
      plugins: {
        legend: {
          position: "top" as const,
        },
        datalabels: {
          display: !isMobile(), 
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: t("chart.x"),  // Label for the x-axis (you can change this)
          }
        },
        y: {
          title: {
            display: true,
            text: t("chart.y"),  // Label for the x-axis (you can change this)
          }
        }
      }
    };

    const today = new Date();
    const currentHour = today.getHours();
    const formattedTime = `${currentHour < 10 ? '0' : ''}${currentHour}.00`; 

    const formattedData = {
      labels: prices.map((item) => item.date),
      datasets: [
          {
              label: t("chart.label"),
              data: prices.map((item) => item.value),
              backgroundColor: prices.map((item) => 
                item.date == formattedTime ? "rgba(191, 75, 8, 0.6)" : "rgba(211, 159, 17, 0.6)" 
              ),
          },
      ],
    };

    function RenderTitle(){
      switch (timePeriod) {
        case "today":
          return <h3>{t("chart.chartTitleToday")}</h3>

        case "week":
          return <h3>{t("chart.chartTitleWeek")}</h3>

        case "month":
          return <h3>{t("chart.chartTitleMonth")}</h3>

        default:
          return <h3>{t("chart.chartTitleToday")}</h3>
      }
    }
    return (
        <>
    <div className='info-box-chart'>
      <Container className="form-container">
        <div className='section'>
          {RenderTitle()}
        </div>

        <Container className='chart-container'>
          {loading ? (
          <div className="loading-animation-container">
            <div className="loading-animation">
              <Lottie animationData={animationData} loop={true} />
            </div>
          </div>
          ) : <Bar options={options} data={formattedData}/>}
        </Container>
        
        <div className='filter-options'>
          <Button 
            onClick={()=>setTimePeriod("today")}
            className={timePeriod=="today" ? "btn selected" : "btn"}
          >
          {t('day')}
          </Button>
          <Button
            onClick={()=>setTimePeriod("week")}
            className={timePeriod=="week" ? "btn selected" : "btn"}
          >
          {t('week')}
          </Button>
          <Button
            onClick={()=>setTimePeriod("month")}
            className={timePeriod=="month" ? "btn selected" : "btn"}
          >
          {t('month')}
          </Button>
        </div>

      </Container>
      </div>

        </>
    )
}