import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/Privacynotice.css';
import Header from './Header'; 
import Footer from './Footer';

const PrivacyNotice = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const sections = [
        { header: t('privacy.header0'), content: "" }, 
        { header: t('privacy.header1'), content: t('privacy.content1') }, 
        { header: t('privacy.header2'), content: t('privacy.content2') }, 
        { header: t('privacy.header3'), content: t('privacy.content3') }, 
        { header: t('privacy.header4'), content: t('privacy.content4') }, 
        { header: t('privacy.header5'), content: t('privacy.content5') }, 
        { header: t('privacy.header6'), content: t('privacy.content6') }, 
        { header: t('privacy.header7'), content: t('privacy.content7') }, 
        { header: t('privacy.header8'), content: t('privacy.content8') }, 
        { header: t('privacy.header9'), content: t('privacy.content9') }, 
        { header: t('privacy.header10'), content: t('privacy.content10') }, 
        { header: t('privacy.header11'), content: t('privacy.content11') }, 
        { header: t('privacy.header12'), content: t('privacy.content12') }, 
        { header: t('privacy.header13'), content: t('privacy.content13') }, 
    ];
    const handleBackToHomepage = () => {
        navigate('/'); 
    };

    return (
        <>
            <Header />
            <div className="privacy-notice">
                {sections.map((section, index) => (
                    <div key={index} className="privacy-section">
                        <h2 className="privacy-header">{section.header}</h2>
                        <p className="privacy-content">
                            {section.content.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    {i < section.content.split('\n').length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </p>
                    </div>
                ))}
                <button className="back-button" onClick={handleBackToHomepage}>
                    {t('back')} {/* Assuming you have a translation key for "Back" */}
                </button>
            </div>
            <Footer />
        </>
    );
}

export default PrivacyNotice;
