import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import XIcon from '@mui/icons-material/X';
import GitHubIcon from '@mui/icons-material/GitHub';
 
const Footer = () => {
  const { t } = useTranslation();
  const [isGitHubMenuOpen, setGitHubMenuOpen] = useState(false);
  const githubDropdownRef = useRef<HTMLDivElement>(null);
  const toggleGitHubMenu = () => {
    setGitHubMenuOpen((prevState) => !prevState);
  };

  // Closes the dropdown when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (githubDropdownRef.current && !githubDropdownRef.current.contains(event.target as Node)) {
      setGitHubMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isGitHubMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isGitHubMenuOpen]);

  return (
    <footer className="footer w-100">
      <Container fluid>
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <img
              src="./assets/xamk_logo_tiivis_kehys_keltainen_rgb.png"
              alt="Xamk Logo"
              className="footer-logo mb-2"
            />
           
            <p className="text-white mb-0">© 2024 Xamk</p>
          </Col>
        </Row>
        <Row className="justify-content-center mt-3">
          <Col md={6} className="text-center">
            <div className="footer-links">
              <a href="https://www.xamk.fi" className="text-white">
                <span className="footer-icon-container"><LanguageIcon className="footer-icon" /></span>
              </a> 
              <a href="https://www.instagram.com/xamkfi" className="text-white">
                <span className="footer-icon-container"><InstagramIcon className="footer-icon" /></span>
              </a> 
              <a href="https://www.youtube.com/channel/UC0hDPOZXMUxd51l0CA9noJg" className="text-white">
                <span className="footer-icon-container"><YouTubeIcon className="footer-icon" /></span>
              </a> 
              <a href="https://www.facebook.com/xamk" className="text-white">
                <span className="footer-icon-container"><FacebookIcon className="footer-icon" /></span>
              </a> 
              <a href="https://www.linkedin.com/school/xamk" className="text-white">
                <span className="footer-icon-container"><LinkedInIcon className="footer-icon" /></span>
              </a> 
              <a href="https://www.twitter.com/xamkfi" className="text-white">
                <span className="footer-icon-container"><XIcon className="footer-icon" /></span>
              </a>

              <div className="github-dropdown" ref={githubDropdownRef}>
                <span className="footer-icon-container" onClick={toggleGitHubMenu}>
                  <GitHubIcon className="footer-icon" />
                </span>
                {isGitHubMenuOpen && (
                  <div className="github-dropdown-menu">
                    <a href="https://github.com/xamkfi/tempus-frontend" className="text-white">
                      Frontend
                    </a>
                    <a href="https://github.com/xamkfi/tempus-electrica-backend" className="text-white">
                      Backend
                    </a>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
        <Row className='justify-content-center mt-3'>
          <Col md={6} className="text-center">
            <p className="text-white mb-0">{t('DataResource')} <a href="https://www.entsoe.eu/data/transparency-platform/" className="text-white">Entso-E</a></p>
          </Col>
        </Row>
        <Row className='justify-content-center mt-3'>
          <Col md={6} className="text-center">
            <p className="text-white mb-0">
              <a href="/contact" className="text-white">{t('privacy.header0')}</a> {/* Privacy Policy */}
            </p>
          </Col>
        </Row>
        <Row className='justify-content-center mt-3'>
          <Col md={6} className="text-center">
            <p className="text-white mb-0">
              <a href="/privacy-notice" className="text-white">{t('privacy.header0')}</a> {/* Privacy Policy */}
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};
 
export default Footer;