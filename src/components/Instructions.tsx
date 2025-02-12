import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/instructions.css';
import Header from './Header'; 
import Footer from './Footer';

const Instructions = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleBackClick = () => {
        navigate('/');
    };

    return (
        <>
            <Header /> {/* Keep the Header component outside the instructions container */}
            <div className="instructions-container">
                <div className="instructions">
                    <h2>{t('instructionsTitle')}</h2>
                    <div className="instruction-step">
  <p>
    {t('step1BeforeLink')}{' '}
    <a href="#" onClick={(event) => {
      event.preventDefault();
      window.open("https://oma.datahub.fi/#/login?returnUrl=%2F", "_blank");
    }}>
      {t('FingridcustomerportalLink')}
    </a>
    {t('step1AfterLink')}
  </p>
  <img src="./assets/FinGridLogIn.png" alt={t('step1ImgAlt')} />
</div>
                    <div className="instruction-step">
                        <p>{t('step2')}</p>
                        <img src="./assets/selectAddressEdited.png" alt={t('step2ImgAlt')} />
                    </div>
                    <div className="instruction-step">
                        <p dangerouslySetInnerHTML={{ __html: t('step3') }} />
                        <img src="./assets/selectNrG&DownloadInformation.png" alt={t('step3ImgAlt')} />
                    </div>
                    <div className="instruction-step">
                        <p>{t('step4')}</p>
                        <img src="./assets/selectDateAndAccountingPointEdited.png" alt={t('step4ImgAlt')} />
                    </div>
                    <div className="instruction-step">
                        <p dangerouslySetInnerHTML={{ __html: t('step5') }} />
                    </div>
                    <div className="instruction-step">
                        <p dangerouslySetInnerHTML={{ __html: t('step6') }} />
                    </div>
                    <button className="back-button" onClick={handleBackClick}>{t('backButton')}</button>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default Instructions;
