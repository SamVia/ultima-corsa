import { useState, useEffect, useRef, useMemo } from 'react';
import { Container, Spinner, Alert, Card, Button, ProgressBar, Row, Col, Badge } from 'react-bootstrap';
import ForceGraph2D from 'react-force-graph-2d';
import API from './API';
import { useAuth } from './AuthContext';

function GiocoFacile() {
  // Estrai setUser dal contesto per aggiornare i punti dopo una partita
  const { setUser } = useAuth();
  const fgRef = useRef();
  const haFattoZoomRef = useRef(false);

  const [stazioni, setStazioni] = useState([]);
  const [tratte, setTratte] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inGioco, setInGioco] = useState(false);
  const [missione, setMissione] = useState(null);
  const [tempo, setTempo] = useState(90);
  const [percorso, setPercorso] = useState([]); 
  const [risultato, setRisultato] = useState(null);

  // caricamento dati all'avvio
  useEffect(() => {
    const caricaMappa = async () => {
      try {
        const data = await API.getMappa();
        setStazioni(data.stazioni);
        setTratte(data.tratte);
      } catch (err) {
        setError(err.message || 'Errore nel caricamento della mappa');
      } finally {
        setLoading(false);
      }
    };
    caricaMappa();
  }, []);

  // useEffect per configurare le forze del grafo dopo il caricamento dei dati 
  useEffect(() => {
    if (fgRef.current && !loading) {
      // Allunga la distanza dei link
      fgRef.current.d3Force('link').distance(60); 
      // Aumenta la repulsione tra i nodi
      // Numeri più negativi = maggiore repulsione
      fgRef.current.d3Force('charge').strength(-120); 
    }
  }, [loading, stazioni, tratte]);

  // implementazione timer di gioco
  useEffect(() => {
    let intervallo;
    if (inGioco && tempo > 0) {
      // Se il gioco è attivo e il tempo è maggiore di 0, decrementa ogni secondo
      intervallo = setInterval(() => setTempo((t) => t - 1), 1000);
    } else if (inGioco && tempo === 0) {
      handleConfermaPartita();
    }
    // Cleanup del timer
    return () => clearInterval(intervallo);
  }, [inGioco, tempo]);

  // partita asincrona

  const handleIniziaPartita = async () => {
    try {
      const data = await API.getNuovaPartita();
      setMissione(data);
      setPercorso([parseInt(data.partenza_id, 10)]); 
      setTempo(90); 
      setRisultato(null); 
      setInGioco(true); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNodeClick = (node) => {
    if (!inGioco) return; 
    
    // Sicurezza: Impedisci la rimozione della stazione di partenza (il primo nodo)
    if (percorso.length > 0 && percorso[0] === node.id) {
      return; 
    }
    
    // Controllo: Il nodo è già nel percorso?
    if (percorso.includes(node.id)) {
      // Lo rimuoviamo dall'array
      const nuovoPercorso = percorso.filter((id) => id !== node.id);
      setPercorso(nuovoPercorso);
    } else {
      // Lo aggiungiamo alla fine del percorso
      setPercorso([...percorso, node.id]);
    }
  };

  const handleConfermaPartita = async () => {
    setInGioco(false); 
    try {
      const res = await API.eseguiPartita(percorso);
      setRisultato(res);
      // Aggiorna i dati dell'utente (punti) nella navbar
      const updatedUser = await API.getUserInfo();
      setUser(updatedUser);
    } catch (err) {
      setError(err.message);
    }
  };

  // prende il nome di una stazione dato il suo id
  const getNomeStazione = (id) => {
    const s = stazioni.find((staz) => parseInt(staz.id, 10) === parseInt(id, 10));
    return s ? s.nome : `ID: ${id}`;
  };

  const getColoreLinea = (nomeLinea) => {
    const colori = {
      'Linea Rossa': '#dc3545',
      'Linea Verde': '#198754',
      'Linea Blu': '#0d6efd',
      'Linea Gialla': '#ffc107',
      'Linea Viola': '#6f42c1',
    };
    return colori[nomeLinea] || '#6c757d'; 
  };

  // Funzione che verifica se il collegamento sulla mappa è stato selezionato tramite i nodi
  const isLinkInPath = (link) => {
    if (percorso.length < 2) return false;
    
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;

    for (let i = 0; i < percorso.length - 1; i++) {
      const p1 = percorso[i];
      const p2 = percorso[i + 1];
      if ((p1 === sourceId && p2 === targetId) || (p1 === targetId && p2 === sourceId)) {
        return true;
      }
    }
    return false;
  };

  // preparazione dei dati nel formato richiesto da ForceGraph2D
  const graphData = useMemo(() => {
    return {
      nodes: stazioni.map((s) => ({
        id: parseInt(s.id, 10),
        nome: s.nome,
        snodo: s.snodo,
        val: s.snodo ? 1 : 0 
      })),
      links: tratte.map((t) => ({
        source: parseInt(t.stazione_partenza, 10),
        target: parseInt(t.stazione_arrivo, 10),  
        linea: t.nome_linea          
      }))
    };
  }, [stazioni, tratte]); 

  // Disegna i nodi (Stazioni)
  const drawNode = (node, ctx, globalScale) => {
    const label = node.nome.split(' '); 
    const fontSize = 20 / globalScale; 
    ctx.font = `${fontSize}px Sans-Serif`;
    
    // Controllo se la stazione è stata selezionata
    const isSelected = percorso.includes(parseInt(node.id, 10));
    
    // Disegno del nodo (cerchio)
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.snodo ? 6 : 5, 0, 2 * Math.PI, false);
    
    // Colora il nodo di rosso se selezionato, altrimenti giallo (snodo) o bianco
    ctx.fillStyle = isSelected ? '#dc3545' : (node.snodo ? '#ffc107' : '#ffffff'); 
    ctx.fill();
    ctx.lineWidth = isSelected ? 2 : 1;
    ctx.strokeStyle = '#000000'; 
    ctx.stroke();

    // Impostazioni allineamento testo
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const lineHeight = fontSize * 1.2; 
    const startY = node.y + (node.snodo ? 10 : 7); 
    
    // Disegno le etichette con lo sfondo semi-trasparente
    label.forEach((line, index) => {
      const yPos = startY + (index * lineHeight);
      const textWidth = ctx.measureText(line).width;
      
      // 1. Disegno il rettangolo di sfondo (bianco all'80%)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      ctx.fillRect(node.x - (textWidth / 2) - 2 + 35, yPos - 2, textWidth + 4, fontSize + 4 );
      
      // 2. Disegno il testo vero e proprio
      ctx.fillStyle = '#333333'; 
      ctx.fillText(line, node.x + 35, yPos);
    });
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" variant="success" />
        <p className="mt-2">Costruzione della rete metropolitana in corso...</p>
      </Container>
    );
  }

  if (error) {
    return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="mt-4 pb-5">
      
      <Card className="mb-4 shadow-sm border-primary">
        <Card.Body>
          {!inGioco && !risultato && (
            <div className="text-center py-3">
              <h3>Pronto per la tua missione?</h3>
              <p>Clicca sul pulsante per ricevere la stazione di partenza e quella di arrivo.</p>
              <Button size="lg" variant="success" onClick={handleIniziaPartita}>Richiedi Missione</Button>
            </div>
          )}

          {inGioco && (
            <>
              <Row className="align-items-center mb-3">
                <Col md={8}>
                  <h4 className="mb-2">Missione in corso:</h4>
                  <div className="fs-5">
                    Parti da: <Badge bg="primary">{getNomeStazione(missione.partenza_id)}</Badge> <br/>
                    Arriva a: <Badge bg="danger" className="mt-2">{getNomeStazione(missione.arrivo_id)}</Badge>
                  </div>
                </Col>
                <Col md={4} className="text-md-end text-center mt-3 mt-md-0">
                  <div className="fs-3 fw-bold text-danger mb-2">Tempo: {tempo}s</div>
                  <Button variant="warning" size="lg" onClick={handleConfermaPartita}>Conferma Percorso</Button>
                </Col>
              </Row>
              
              <ProgressBar 
                variant={tempo > 30 ? "info" : "danger"} 
                now={(tempo / 90) * 100} 
                className="mb-3" 
              />
            </>
          )}

          {/* RIEPILOGO DEL PERCORSO */}
          {(inGioco || risultato) && (
            <div className="bg-light p-3 rounded border mb-3">
              <strong className="d-block mb-2 text-primary">Il tuo percorso: </strong> 
              <div className="fs-5">
                {percorso.length === 0 ? (
                  <span className="text-muted">Nessuna stazione selezionata.</span>
                ) : (
                  percorso.map((id, idx) => (
                    <span key={idx} className="d-inline-block me-2 mb-2">
                      {idx > 0 && <span className="text-dark mx-2">{'>'}</span>}
                      <span className="fw-bold">{getNomeStazione(id)}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          )}

          {risultato && !inGioco && (
            <div className="text-center">
              <Alert variant={risultato.valido ? "success" : "danger"}>
                <h4>{risultato.valido ? "Percorso Valido" : "Percorso Non Valido"}</h4>
                <p className="fs-4 mb-0">Hai guadagnato: <strong>{risultato.punteggio_finale} Punti</strong></p>
              </Alert>
              
              {risultato.cronistoria && risultato.cronistoria.length > 0 && (
                <div className="text-start mt-3 p-3 bg-light rounded border" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  <h5 className="mb-3">Cronistoria del viaggio:</h5>
                  <ul className="mb-0 text-muted">
                    {risultato.cronistoria.map((evento, idx) => (
                      <li key={idx} className="mb-2">
                        <strong>{evento.tappa}:</strong> {evento.evento} 
                        <Badge bg={evento.variazione > 0 ? 'success' : evento.variazione < 0 ? 'danger' : 'warning'} className="ms-2">
                          {evento.variazione >= 0 ? '+' + evento.variazione : evento.variazione}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button className="mt-4" variant="primary" onClick={handleIniziaPartita}>Gioca una nuova partita</Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <h2 className="text-center mb-3">Mappa delle stazioni</h2>
      <Card className="shadow-sm mb-4 overflow-hidden" style={{ border: '2px solid #343a40' }}>
        
        <div style={{ width: '100%', height: '600px', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'center' }}>
          <ForceGraph2D
            ref={fgRef}
            height={600}
            graphData={graphData} 
            nodeCanvasObject={drawNode} 
            
            // Ripristinata la visibilità dei link non selezionati
            linkColor={(link) => {
              const color = getColoreLinea(link.linea);
              return isLinkInPath(link) ? color : color + '4D'; // '4D' aggiunge trasparenza a quelli inattivi
            }} 
            linkWidth={(link) => isLinkInPath(link) ? 5 : 2} // Tratte attive: 5, Tratte inattive: 2
            
            enableNodeDrag={false} 
            enableZoomPanInteraction={true} 
            warmupTicks={200}
            cooldownTicks={0}
            onEngineStop={() => { 
              if (fgRef.current && !haFattoZoomRef.current) { 
                haFattoZoomRef.current = true; 
                fgRef.current.zoomToFit(400, 30); 
              }
            }}
            onNodeClick={handleNodeClick} 
          />
        </div>
      </Card>
      
      <p className="text-muted text-center mt-2 small">
        clicka sulle stazioni della mappa per costruire il tuo percorso.
      </p>
    </Container>
  );
}

export default GiocoFacile;