import { useState, useEffect } from 'react';
import { Container, Table, Spinner, Alert, Card } from 'react-bootstrap';
import API from './API';

function Classifica() {
  const [classifica, setClassifica] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect viene eseguito una sola volta all'apertura della pagina
  useEffect(() => {
    const fetchClassifica = async () => {
      try {
        const data = await API.getClassifica();
        setClassifica(data);
      } catch (err) {
        setError(err.message || 'Errore nel caricamento della classifica');
      } finally {
        setLoading(false);
      }
    };
    fetchClassifica();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Caricamento della classifica...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Si è verificato un errore: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="shadow">
        <Card.Header as="h3" className="bg-dark text-white text-center">Classifica</Card.Header>
        <Card.Body>
          {classifica.length === 0 ? (
            <Alert variant="info" className="text-center">
              Nessuna partita giocata finora.
            </Alert>
          ) : (
            <Table striped bordered hover responsive className="text-center mt-2">
              <thead className="table-dark">
                <tr>
                  <th>Posizione</th>
                  <th>Username</th>
                  <th>Monete 🪙</th>
                  <th>Partite Giocate</th>
                </tr>
              </thead>
              <tbody>
                {/* ciclo l'array della classifica per creare una riga della tabella per ogni utente */}
                {classifica.map((utente, index) => (
                  <tr key={index}>
                    <td className="fw-bold fs-5">
                      {/* medaglie al podio */}
                      {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : index + 1}
                    </td>
                    <td className="fw-bold">{utente.username}</td>
                    <td>{utente.punteggio}</td>
                    <td>{utente.partite_giocate}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Classifica;