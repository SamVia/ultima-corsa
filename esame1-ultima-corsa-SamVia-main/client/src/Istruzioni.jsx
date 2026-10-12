import React from 'react';
import { Container, Card, Row, Col, Button, ListGroup, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Istruzioni({ loggedIn }) {
  return (
    <Container className="mt-5 pb-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-success border-2 rounded">
            <Card.Header className="bg-success text-white text-center py-4">
              <h2 className="mb-0">Regolamento: L'Ultima Corsa</h2>
            </Card.Header>
            <Card.Body className="p-4 p-md-5">
              
              <h4 className="text-success mb-3">Obiettivo del Gioco</h4>
              <p className="fs-5 text-muted">
                Il giocatore deve completare un percorso all'interno di una rete metropolitana fittizia, partendo da una stazione iniziale fino a una destinazione assegnata casualmente. Gestisci il tuo budget iniziale di <strong>20 monete</strong> e affronta gli eventi casuali lungo il tragitto per ottenere il punteggio migliore.
              </p>

              <hr className="my-4" />

              <h4 className="text-success mb-3">Modalità di Gioco</h4>
              <p className="fs-5 text-muted">Puoi affrontare l'avventura in due modi differenti:</p>
              <ListGroup className="mb-4">
                <ListGroup.Item>
                  <h5 className="mb-1 text-success">Modalità Classica </h5>
                  La mappa mostrerà solo le stazioni, senza i collegamenti. Avrai <strong>90 secondi</strong> per ricostruire mentalmente la rete e selezionare le tratte corrette da un elenco testuale.
                </ListGroup.Item>
                <ListGroup.Item>
                  <h5 className="mb-1 text-success">Modalità Semplificata</h5>
                  Una modalità più rilassata in cui puoi costruire il tuo percorso cliccando direttamente le stazioni in sequenza sul grafo della mappa interattiva.
                </ListGroup.Item>
              </ListGroup>

              <hr className="my-4" />

              <h4 className="text-success mb-3">Fasi della Partita</h4>
              <ListGroup variant="flush" className="fs-5 mb-4">
                <ListGroup.Item>
                  <strong>1. Setup:</strong> Osserva la mappa completa della rete, incluse tutte le stazioni e le linee di collegamento. Preparati a memorizzare i percorsi.
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>2. Pianificazione:</strong> Costruisci il tuo percorso dalla stazione di partenza a quella di arrivo (tramite elenco tratte o cliccando sul grafo, a seconda della modalità scelta). Conferma l'itinerario prima che scada l'eventuale tempo limite!
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>3. Esecuzione:</strong> Il sistema validerà il percorso inserito. Per ogni tappa, si verificherà un evento casuale che modificherà il totale delle tue monete. Attenzione: un percorso non valido comporterà la perdita di tutte le monete.
                </ListGroup.Item>
                <ListGroup.Item>
                  <strong>4. Risultato:</strong> Al termine del viaggio, il punteggio finale (monete rimanenti) verrà registrato. Il tuo miglior risultato apparirà nella classifica generale.
                </ListGroup.Item>
              </ListGroup>

              <Alert variant="info" className="fs-5 border-start border-4 border-info">
                <strong>Nota sugli interscambi:</strong> I cambi di linea sono consentiti esclusivamente nelle stazioni di interscambio (stazioni servite da più di una linea).
              </Alert>

              <div className="text-center mt-5">
                {loggedIn ? (
                  <Button as={Link} to="/gioco" variant="success" size="lg" className="px-5 shadow-sm">
                    Inizia Nuova Partita
                  </Button>
                ) : (
                  <Button as={Link} to="/login" variant="outline-success" size="lg" className="px-5 shadow-sm">
                    Accedi per Giocare
                  </Button>
                )}
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Istruzioni;