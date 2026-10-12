import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Container, Navbar, Nav, Button, Spinner } from 'react-bootstrap';
import { useAuth } from './AuthContext';
import Login from './Login';
import Homepage from './Homepage';
import Classifica from './Classifica';
import Istruzioni from './Istruzioni';
import Hub from './Hub';

function App() {
  const { user, loggedIn, loading, logout } = useAuth();

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status" />
        <p>Caricamento in corso...</p>
      </Container>
    );
  }

  return (
    <BrowserRouter>
    <Navbar bg="success" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">Ultima Corsa</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          
          {/* link navbar - Istruzioni accessibile a tutti mentre il resto solo se loggati */}
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/istruzioni">Istruzioni</Nav.Link>
            {loggedIn && <Nav.Link as={Link} to="/classifica">Classifica</Nav.Link>}
            {loggedIn && <Nav.Link as={Link} to="/gioco">Gioco</Nav.Link>}
          </Nav>

          {/* pulsante login */}
          <Nav>
            {loggedIn ? (
              <>
                <Navbar.Text className="me-3">
                  {user.username} - Punti: {user.punteggio}
                </Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={logout}>Logout</Button>
              </>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

      {/* routes */}
      <Container fluid className="mt-4">
        <Routes>
          
          {/* root */}
          <Route path="/" element={<Homepage />} />
          
          {/* login */}
          <Route path="/login" element={
            loggedIn 
              ? <Navigate replace to="/" /> 
              : <Login />
          } />

          {/* istruzioni */}
          <Route path="/istruzioni" element={<Istruzioni loggedIn={loggedIn} />} />

          {/* classifica */}
          <Route path="/classifica" element={
            loggedIn ? <Classifica /> : <Navigate replace to="/login" />
          } />
          
          
          {/* gioco */}
          <Route path="/gioco" element={
            loggedIn ? <Hub /> : <Navigate replace to="/login" />
          } />

          {/* tutto il resto punta a root */}
          <Route path="*" element={<Navigate replace to="/" />} />
          
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;