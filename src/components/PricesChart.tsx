import {  Container,  Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { DefaultPrices } from '../services/FetchElectricityPrices';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import animationData from "./loadingAnimation.json";

//testi
interface Price {
  date: string;
  value: number;
}

export default function PricesChart(){

    const { t } = useTranslation();
    const [prices, setPrices] = useState<Price[]>([]);
    const [timePeriod, setTimePeriod] = useState<"today" | "day" | "week" | "month">("day")
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
      const storedData = sessionStorage.getItem(`${timePeriod}Data`);
      if(storedData){
        setPrices(JSON.parse(storedData));
      }
      else{
        TuoJaFormatoiData();
      }
      console.log(prices);

    },[timePeriod])

    async function TuoJaFormatoiData(){

      setLoading(true);
      const data: Price[] = await DefaultPrices(timePeriod);
      let formattedData: Price[] = [];
      const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      console.log(data);

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

        case "day":
          
          const dictionar: Record<string,{"total": number, "value": number}> = {}
          
          sortedData.forEach(item => {
            const day = new Date(item.date).toLocaleTimeString();
  
            dictionar[day].total += 1;
            dictionar[day].value += item.value;
          });
          formattedData = Object.keys(dictionar).map(item =>({
            date: item
          }))
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
      sessionStorage.setItem(`${timePeriod}Data`, JSON.stringify(formattedData))
      console.log("data: ", sessionStorage.getItem(timePeriod+"Data"));
      setLoading(false);
      setPrices(formattedData);
    }

    const options = {
      responsive: true,
      maintainAspectRatio: false, // Allow custom width/height adjustments
      plugins: {
        legend: {
          position: "top" as const,
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: `per ${timePeriod}`,  // Label for the x-axis (you can change this)
          }
        },
        y: {
          title: {
            display: true,
            text: "c/kWh price",  // Label for the x-axis (you can change this)
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
              label: "c/kWh",
              data: prices.map((item) => item.value),
              backgroundColor: prices.map((item) => 
                item.date == formattedTime ? "rgba(255, 94, 0, 0.6)" : "rgba(211, 159, 17, 0.6)" 
              ),
          },
      ],
    };

    function RenderTitle(){
      switch (timePeriod) {
        case "today":
          return <h3>{t("contact.chartTitleToday")}</h3>

        case "day":
          return <h3>{t("contact.chartTitleDay")}</h3>

        case "week":
          return <h3>{t("contact.chartTitleWeek")}</h3>

        case "month":
          return <h3>{t("contact.chartTitleMonth")}</h3>

        default:
          return <h3>{t("contact.chartTitleDay")}</h3>
      }
    }
    return (
        <>
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
            onClick={()=>setTimePeriod("day")}
            className={timePeriod=="day" ? "btn selected" : "btn"}
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

        </>
    )
}