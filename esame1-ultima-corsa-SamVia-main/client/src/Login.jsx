import { useState } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Login() {
  // Estrai la funzione di login dal contesto
  const { login } = useAuth();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault(); // Evita che la pagina si ricarichi
    setErrorMessage(''); // Pulisce eventuali errori precedenti

    // Controllo lato frontend
    if (!user || !password) {
      setErrorMessage("Inserisci sia username che password.");
      return;
    }

    try {
      // Usa la funzione del context per fare il login
      await login({ user, password });
      
      // Rimanda l'utente alla pagina principale (o alla mappa)
      navigate('/');
    } catch (err) {
      // Se il backend restituisce 401 (Password errata, ecc.)
      setErrorMessage(err.message);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center mt-5">
      <Card style={{ width: '25rem' }} className="shadow">
        <Card.Body>
          <Card.Title className="text-center mb-4">Accesso Personale</Card.Title>
          
          {/* Mostra il banner di errore se le credenziali sono sbagliate */}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Inserisci il tuo username" 
                value={user}
                onChange={(e) => setUser(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Inserisci la password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Entra nel sistema
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;