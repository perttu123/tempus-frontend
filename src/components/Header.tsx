import React from 'react';
import { useTranslation } from 'react-i18next';
import { Row, Col, Dropdown, DropdownButton } from 'react-bootstrap';
import i18n from '../localization/pagelocalization'; 
import '../styles/Header.css';

const Header = () => {
  const { t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang); 
  };

  return (
    <header className="header-container">
      <img src='./assets/xamklogowhite.png' height={68} width={173} alt="Xamk Logo" className="logo" />
      <h1 className='mainHeader'>{t('title')}</h1>
      <div className='language-btn'>
        <DropdownButton id="dropdown-basic-button" title={i18n.language.toUpperCase()} className="language-dropdown">
          <Dropdown.Item
            className={i18n.language === 'fi' ? 'selected' : ''}
            onClick={() => changeLanguage('fi')}
          >
            FI
          </Dropdown.Item>
          <Dropdown.Item
            className={i18n.language === 'en' ? 'selected' : ''}
            onClick={() => changeLanguage('en')}
          >
            EN
          </Dropdown.Item>
        </DropdownButton>
      </div>
    </header>
  );
};

export default Header;
