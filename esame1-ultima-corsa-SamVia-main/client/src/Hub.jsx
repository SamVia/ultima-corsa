import { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import Gioco from './Gioco';
import GiocoFacile from './GiocoFacile';

function Hub() {
  // Traccia la modalità di gioco selezionata: 'menu', 'bottoni', o 'grafico'
  const [modalita, setModalita] = useState('menu');

  // Se l'utente ha scelto la modalità bottoni, mostro il componente Gioco
  if (modalita === 'bottoni') {
    return (
      <>
        {/* Pulsante per annullare e tornare al menu delle modalità */}
        <Container className="mt-3">
          <Button variant="outline-secondary" onClick={() => setModalita('menu')}>
            Torna alla scelta della modalità
          </Button>
        </Container>
        <Gioco />
      </>
    );
  }

  // Se l'utente ha scelto la modalità grafica, mostro il componente GiocoFacile
  if (modalita === 'grafico') {
    return (
      <>
        <Container className="mt-3">
          <Button variant="outline-secondary" onClick={() => setModalita('menu')}>
            Torna alla scelta della modalità
          </Button>
        </Container>
        <GiocoFacile />
      </>
    );
  }

  // Menu principale di selezione delle modalità di gioco
  return (
    <Container className="mt-5 text-center">
      <h2 className="mb-5 fw-bold">Seleziona la tua Modalità di Gioco</h2>
      
      <Row className="justify-content-center gap-4">
        
        {/* Opzione: Modalità Bottoni */}
        <Col md={5}>
          <Card 
            className="shadow-sm h-100 py-4 border-primary" 
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
            onClick={() => setModalita('bottoni')}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Card.Body>
              <div className="display-1 mb-3">
                      <pre style={{ fontFamily: 'monospace', lineHeight: '1.2', fontWeight: 'bold', fontSize: '30px' }}>
        {/* Fumo (Grigio) */}
        <span style={{ color: 'gray' }}>{`     e@@@@@@@@@@@@@@@\n`}</span>
        <span style={{ color: 'gray' }}>{`    @@@""""""""""\n`}</span>
        <span style={{ color: 'gray' }}>{`   @" `}</span>
        
        {/* Treno (Rosso) */}
        <span style={{ color: '#dc3545' }}>{`___ ___________\n`}</span>
        <span style={{ color: '#dc3545' }}>{`  II__[w] | [i] [z] |\n`}</span>
        <span style={{ color: '#dc3545' }}>{` {======|_|~~~~~~~~~|\n`}</span>
        
        {/* Ruote e base (Nero) */}
        <span style={{ color: 'black' }}>{`/oO--000'"\`-OO---OO-'`}</span>
      </pre>
              </div>
              <Card.Title className="fs-3 text-primary">Modalità Tratte</Card.Title>
              <Card.Text className="text-muted mt-3 fs-5">
                Costruisci il tuo percorso assemblando i pezzi di binario tramite una comoda pulsantiera. Ideale per i veri strateghi!
              </Card.Text>
              <Button variant="primary" size="lg" className="mt-4 px-4">
                Gioca a Tratte
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Opzione: Modalità Grafica */}
        <Col md={5}>
          <Card 
            className="shadow-sm h-100 py-4 border-success" 
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }} 
            onClick={() => setModalita('grafico')}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Card.Body>
              <div className="display-1 mb-3">
                <pre style={{ fontFamily: 'monospace', lineHeight: '1.2', fontWeight: 'bold', fontSize: '15px' }}>
                  <span style={{ color: '#0d6efd' }}>{`________\n`}</span>
                  <span style={{ color: '#0d6efd' }}>{`,o`}</span><span style={{ color: '#198754' }}>{`88`}</span><span style={{ color: '#0d6efd' }}>{`~~`}</span><span style={{ color: '#198754' }}>{`88888888`}</span><span style={{ color: '#0d6efd' }}>{`o,\n`}</span>
                  <span style={{ color: '#0d6efd' }}>{`,~~?`}</span><span style={{ color: '#198754' }}>{`8P`}</span><span style={{ color: '#0d6efd' }}>{`  `}</span><span style={{ color: '#198754' }}>{`88888`}</span><span style={{ color: '#0d6efd' }}>{`     `}</span><span style={{ color: '#198754' }}>{`8`}</span><span style={{ color: '#0d6efd' }}>{`,\n`}</span>
                  <span style={{ color: '#0d6efd' }}>{`d  `}</span><span style={{ color: '#198754' }}>{`d88`}</span><span style={{ color: '#0d6efd' }}>{` `}</span><span style={{ color: '#198754' }}>{`d88`}</span><span style={{ color: '#0d6efd' }}>{` `}</span><span style={{ color: '#198754' }}>{`d8`}</span><span style={{ color: '#0d6efd' }}>{`_`}</span><span style={{ color: '#198754' }}>{`88`}</span><span style={{ color: '#0d6efd' }}>{`     b\n`}</span>
                  <span style={{ color: '#0d6efd' }}>{`d  `}</span><span style={{ color: '#198754' }}>{`d888888888`}</span><span style={{ color: '#0d6efd' }}>{`          b\n`}</span>
                  <span style={{ color: '#0d6efd' }}>{`8,?`}</span><span style={{ color: '#198754' }}>{`88888888`}</span><span style={{ color: '#0d6efd' }}>{`  `}</span><span style={{ color: '#198754' }}>{`d8`}</span><span style={{ color: '#0d6efd' }}>{`.`}</span><span style={{ color: '#198754' }}>{`b o`}</span><span style={{ color: '#0d6efd' }}>{`.   8\n`}</span>
                  <span style={{ color: '#0d6efd' }}>{`8~`}</span><span style={{ color: '#198754' }}>{`88888888`}</span><span style={{ color: '#0d6efd' }}>{`~ ~^`}</span><span style={{ color: '#198754' }}>{`8888`}</span><span style={{ color: '#0d6efd' }}>{`\\ `}</span><span style={{ color: '#198754' }}>{`db`}</span><span style={{ color: '#0d6efd' }}>{` 8\n`}</span>
                  <span style={{ color: '#0d6efd' }}>{`?  `}</span><span style={{ color: '#198754' }}>{`888888`}</span><span style={{ color: '#0d6efd' }}>{`          ,`}</span><span style={{ color: '#198754' }}>{`888P`}</span><span style={{ color: '#0d6efd' }}>{`\n`}</span>
                  <span style={{ color: '#0d6efd' }}>{`?  \\\``}</span><span style={{ color: '#198754' }}>{`8888b`}</span><span style={{ color: '#0d6efd' }}>{`,_      `}</span><span style={{ color: '#198754' }}>{`d888P`}</span><span style={{ color: '#0d6efd' }}>{`\n`}</span>
                  <span style={{ color: '#0d6efd' }}>{`\\\`   `}</span><span style={{ color: '#198754' }}>{`8888888b`}</span><span style={{ color: '#0d6efd' }}>{`   ,`}</span><span style={{ color: '#198754' }}>{`888`}</span><span style={{ color: '#0d6efd' }}>{`'\n`}</span>
                  <span style={{ color: '#0d6efd' }}>{`                ~-?`}</span><span style={{ color: '#198754' }}>{`888`}</span><span style={{ color: '#0d6efd' }}>{` __.`}</span><span style={{ color: '#198754' }}>{`P8SAM`}</span><span style={{ color: '#0d6efd' }}>{`-~`}</span><span style={{ color: 'gray' }}>{`    credits:seal\n`}</span>
                  <span style={{ color: '#0d6efd' }}>{`~~~~~~~~~~~\n`}</span>
                </pre>
              </div>
              <Card.Title className="fs-3 text-success">Modalità Grafica</Card.Title>
              <Card.Text className="text-muted mt-3 fs-5">
                Interagisci direttamente con la mappa 2D cliccando sui pallini delle stazioni. Perfetta per chi ama esplorare visivamente la rete!
              </Card.Text>
              <Button variant="success" size="lg" className="mt-4 px-4">
                Gioca sulla Mappa
              </Button>
            </Card.Body>
          </Card>
        </Col>

      </Row>
    </Container>
  );
}

export default  Hub;