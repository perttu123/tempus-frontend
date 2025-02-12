import { useState } from "react";
import Header from "./Header"
import { useTranslation } from 'react-i18next';
import { Container, Form, Button, Row , Col} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import '../styles/Contact.css';

export default function Contact(){
//asdasd
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");

    async function HandleEmailSend() {
        if(message=="" || email=="")
        {
            alert(t("contact.alert"))
            return;
        }
        console.log(message);
        setMessage("");
    }
    const { t }= useTranslation();
    return (<>
        <Header/>
        <Container className="form-container">
        
            <h2 className="privacy-header">{t("contact.header1")}</h2>
            <div className="intro-text">
                <h2 className="privacy-header">Mikkeli</h2>
                <p className="privacy-content">
                {t("contact.address")}
                </p>
                <p>{t("contact.y-code")}</p>
                <p>{t("contact.campus-num")}</p>
            </div>         


            <Form className="w-50 w-md-75 w-lg-50 mx-auto" onSubmit={HandleEmailSend}>
            <h2 className="privacy-header">{t("contact.header2")}</h2>
                
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>{t("contact.email")}</Form.Label>
                    <Form.Control type="email" placeholder={t("contact.placeholder1")} onChange={(e)=>setEmail(e.target.value)} value={email} required/>
                </Form.Group>
                <Form.Group className="mb-3 w-100" controlId="exampleForm.ControlTextarea1">
                <Form.Label>{t("contact.message")}</Form.Label>
                    <Form.Control as="textarea" rows={5} onChange={(e) => setMessage(e.target.value)} placeholder={t("contact.placeholder2")} value={message} />
                </Form.Group>
            
                <button
                    type="submit"
                    className="btnContact"
                      >
                    {t('contact.sendButton')}
                </button>
            </Form>

            <button className="back-button" onClick={()=>navigate("/")}>
                {t('back')} 
            </button>

        </Container>
        <Footer/>
    </>)
}