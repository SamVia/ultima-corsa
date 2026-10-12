import { useState, useEffect, useRef, useMemo } from 'react';
import { Container, Spinner, Alert, Card, Button, ProgressBar, Row, Col, Badge } from 'react-bootstrap';
import ForceGraph2D from 'react-force-graph-2d';
import API from './API';
import { useAuth } from './AuthContext';

function Gioco() {
  // Estrai setUser dal contesto per aggiornare i punti dopo una partita
  const { setUser } = useAuth();
  const fgRef = useRef();
  const haFattoZoomRef = useRef(false);

  const [stazioni, setStazioni] = useState([]);
  const [tratte, setTratte] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // stati
  const [percorsoTratte, setPercorsoTratte] = useState([]); //percorso costruito tramite i bottoni, array di oggetti tratta
  const [inGioco, setInGioco] = useState(false);
  const [tempo, setTempo] = useState(90);
  
  // stati per la logica di gioco API
  const [missione, setMissione] = useState(null);
  const [risultato, setRisultato] = useState(null);

  // stato per mostrare a fine partita il percorso e eventi
  const [stepVisualizzazione, setStepVisualizzazione] = useState(0);

  // caricamento dati all'avvio
  useEffect(() => {
    const caricaMappa = async () => {
      try {
        const data = await API.getMappa();
        setStazioni(data.stazioni);
        setTratte(data.tratte);
      } catch (err) {
        setError(err.message || 'Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };
    caricaMappa();
  }, []);

  // useEffect per configurare le forze del grafo dopo il caricamento dei dati 
  // -> trovata la funzione corretta nella libreria react-force-graph-2d

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


  // animazione per mostrare le tratte della cronistoria una alla volta
  useEffect(() => {
    // Si attiva quando arriva il risultato a fine partita
    if (risultato && risultato.cronistoria && risultato.cronistoria.length > 0) {
      
      // se la partita non è andata a buon fine, salta il delay
      if (!risultato.valido) {
        setStepVisualizzazione(risultato.cronistoria.length);
        return; 
      }

      const intervallo = setInterval(() => {
        setStepVisualizzazione((stepAttuale) => {
          // Se alla fine della lista, germo il timer
          if (stepAttuale >= risultato.cronistoria.length) {
            clearInterval(intervallo);
            return stepAttuale;
          }
          // incremento di 1 ogni secondo
          return stepAttuale + 1;
        });
      }, 1000); // 1000ms tra una riga e l'altra

      // Cleanup di sicurezza
      return () => clearInterval(intervallo);
    }
  }, [risultato]);

  // partita asincrona

  const handleIniziaPartita = async () => {
    try {
      const data = await API.getNuovaPartita();
      setMissione(data);
      setPercorsoTratte([]); 
      setTempo(90);          
      setRisultato(null); 
      setInGioco(true); 
      setStepVisualizzazione(0); // imposta l'animazione a 0     
    } catch (err) {
      setError(err.message);
    }
  };

  const getStazioniDalPercorso = () => {
    if (percorsoTratte.length === 0) return [];
    if (percorsoTratte.length === 1) return [percorsoTratte[0].stazione_partenza, percorsoTratte[0].stazione_arrivo];

    const path = [];
    const t1 = percorsoTratte[0];
    const t2 = percorsoTratte[1];

    let currentStation;
    if (t1.stazione_partenza === t2.stazione_partenza || t1.stazione_partenza === t2.stazione_arrivo) {
      path.push(t1.stazione_arrivo);
      currentStation = t1.stazione_partenza;
    } else {
      path.push(t1.stazione_partenza);
      currentStation = t1.stazione_arrivo;
    }
    path.push(currentStation);

    for (let i = 1; i < percorsoTratte.length; i++) {
      const t = percorsoTratte[i];
      if (t.stazione_partenza === currentStation) {
        currentStation = t.stazione_arrivo;
      } else if (t.stazione_arrivo === currentStation) {
        currentStation = t.stazione_partenza;
      } else {
        path.push(t.stazione_partenza);
        currentStation = t.stazione_arrivo;
      }
      path.push(currentStation);
    }
    return path;
  };

  // calcolo l'array delle stazioni visitate solo quando cambia il percorso
  const stazioniVisitate = useMemo(() => getStazioniDalPercorso(), [percorsoTratte]);

  //bottoni mescolati ad ogni partita per evitare che siano in base al colore della tratta
  const bottoniMescolati = useMemo(() => {
    return [...tratte].sort(() => Math.random() - 0.5);
  }, [tratte, missione]);


  const handleConfermaPartita = async () => {
    setInGioco(false); 
    try {
      const arrayStazioniFinali = getStazioniDalPercorso();
      const res = await API.eseguiPartita(arrayStazioniFinali);
      setRisultato(res);
      setStepVisualizzazione(0); // reset animazione per mostrare cronistoria
      // Aggiorna i dati dell'utente (punti) nella navbar
      const updatedUser = await API.getUserInfo();
      setUser(updatedUser);
    } catch (err) {
      setError(err.message);
    }
  };

  // funzioni handling bottoni
  const handleTrattaClick = (tratta) => {
    if (!inGioco) return; // Blocca i click se non stai giocando

    // se la tratta è selezionata
    const isAlreadySelected = percorsoTratte.some(
      (t) => t.stazione_partenza === tratta.stazione_partenza && t.stazione_arrivo === tratta.stazione_arrivo
    );

    if (isAlreadySelected) {
      // se era selezionata, la rimuove dall'array tramite filtro
      const nuovoPercorso = percorsoTratte.filter(
        (t) => !(t.stazione_partenza === tratta.stazione_partenza && t.stazione_arrivo === tratta.stazione_arrivo)
      );
      setPercorsoTratte(nuovoPercorso);
    } else {
      // altrimenti la aggiunge all'array
      setPercorsoTratte([...percorsoTratte, tratta]);
    }
  };

  // prende il nome di una stazione dato il suo id, per mostrare i nomi nei bottoni invece degli id
  const getNomeStazione = (id) => {
    const s = stazioni.find((staz) => parseInt(staz.id, 10) === parseInt(id, 10));
    return s ? s.nome : `ID: ${id}`;
  };

  const getColoreLinea = (nomeLinea) => {
    const colori = {
      // aggiungo linea viola per possibile aggiunta in futuro, default grigio se linea sconosciuta
      'Linea Rossa': '#dc3545',
      'Linea Verde': '#198754',
      'Linea Blu': '#0d6efd',
      'Linea Gialla': '#ffc107',
      'Linea Viola': '#6f42c1', 
    };
    return colori[nomeLinea] || '#6c757d'; 
  };

  // Funzione che verifica se il collegamento sulla mappa è stato selezionato tramite i bottoni
  const checkLinkSelected = (link) => {
    // La libreria trasforma source e target in oggetti dopo il mount, quindi estraiamo l'id
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    return percorsoTratte.some(t => 
      (parseInt(t.stazione_partenza, 10) === sourceId && parseInt(t.stazione_arrivo, 10) === targetId) ||
      (parseInt(t.stazione_partenza, 10) === targetId && parseInt(t.stazione_arrivo, 10) === sourceId)
    );
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
    const isSelected = stazioniVisitate.includes(parseInt(node.id, 10));
    // Disegno del nodo (cerchio)
    ctx.beginPath();
    ctx.arc(node.x, node.y, inGioco? 5: (node.snodo ? 6 : 5), 0, 2 * Math.PI, false);
    
    // Colora il nodo di rosso se selezionato, altrimenti giallo (snodo) o bianco
    //ctx.fillStyle = isSelected ? '#dc3545' : (node.snodo ? '#ffc107' : '#ffffff'); 
    // non colora il nodo se selezionato o snodo, per aumentare la difficoltà come specifiche
    ctx.fillStyle = inGioco ? '#ffffff' : (node.snodo ? '#ffc107' : '#ffffff'); 
    ctx.fill();
    ctx.lineWidth = inGioco? 1: (isSelected ? 2 : 1);
    ctx.strokeStyle = '#000000'; 
    ctx.stroke();

    // Impostazioni allineamento testo
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const lineHeight = fontSize * 1.2; 
    const startY = node.y + (node.snodo ? 10 : 7); 
    
    // Disegno le etichette con lo sfondo semi-trasparente - AI per migliorare la leggibilità e la grafica delle etichette
    label.forEach((line, index) => {
      const yPos = startY + (index * lineHeight);
      
      // Calcolo la larghezza esatta di questa riga di testo
      const textWidth = ctx.measureText(line).width;
      
      // 1. Disegno il rettangolo di sfondo (bianco all'80%)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      // x: centrato rispetto a node.x con un po' di padding (-2px)
      // y: in linea con il testo con un po' di padding (-2px)
      // width/height: grandezza del testo + padding (+4px totali)
      ctx.fillRect(node.x - (textWidth / 2) - 2 + 35, yPos - 2, textWidth + 4, fontSize + 4 );
      
      // 2. Disegno il testo vero e proprio
      ctx.fillStyle = '#333333'; 
      ctx.fillText(line, node.x + 35, yPos);
    });
  };

  if (loading) return <Container className="mt-5 text-center"><Spinner animation="border" variant="success" /></Container>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;

  const isTrattaAnimata = (link) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    
    const tratteSbloccate = percorsoTratte.slice(0, stepVisualizzazione);
    
    return tratteSbloccate.some(t => 
      (parseInt(t.stazione_partenza, 10) === sourceId && parseInt(t.stazione_arrivo, 10) === targetId) ||
      (parseInt(t.stazione_partenza, 10) === targetId && parseInt(t.stazione_arrivo, 10) === sourceId)
    );
  };


  return (
    <Container className="mt-4 pb-5">
      
      {/* dashboard con timer, missione e risultato */}
      <Card className="mb-4 shadow-sm border-success">
        <Card.Body>
          {!inGioco && !risultato && (
            <div className="text-center py-3">
              <h3>Clicca per iniziare</h3>
              <Button size="lg" variant="success" onClick={handleIniziaPartita}>Inizia Partita</Button>
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
                  <div className="fs-2 fw-bold text-danger mb-2">Tempo: {tempo}s</div>
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

          {/* riepilogo del percorso */}
          {(inGioco || risultato) && (
            <div className="bg-light p-3 rounded border mb-3">
              <strong className="d-block mb-2 text-success">Il tuo percorso (Tratte): </strong> 
              <div className="fs-5">
                {percorsoTratte.length === 0 ? (
                  <span className="text-muted">Nessuna tratta selezionata. Scegli i collegamenti dai bottoni.</span>
                ) : (
                  percorsoTratte.map((t, idx) => { 
                    const color = inGioco ? '#000000' : getColoreLinea(t.nome_linea);

                    // ➜ 
                    // ↔
                    return (
                      <span key={idx} className="d-inline-block mb-2">
                        {idx > 0 && <span className="text-dark fw-bold" style={{ fontSize: '1.4rem' }}>{'➜'}</span>}
                        <span className="fw-bold px-2 py-1 rounded" style={{ color: color, border: `2px solid ${color}` }}>
                          {getNomeStazione(t.stazione_partenza)} {'↔'} {getNomeStazione(t.stazione_arrivo)}
                        </span>
                      </span>
                    );
                  })
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
      
                  {/*creo la lista degli eventi della cronistoria*/}
                  {risultato.cronistoria.slice(0, stepVisualizzazione).map((evento, idx) => (
                    <li key={idx} className="mb-2">
                      <strong>{evento.tappa}:</strong> {evento.evento} 
                      <Badge bg={evento.variazione > 0 ? 'success' : evento.variazione < 0 ? 'danger' : 'warning'} className="ms-2">
                        {evento.variazione >= 0 ? '+'+evento.variazione : evento.variazione}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/*<Button className="mt-4" variant="success" onClick={handleIniziaPartita}>Gioca di nuovo</Button>*/}
            {stepVisualizzazione === risultato.cronistoria.length && (
            <Button className="mt-4" variant="success" onClick={handleIniziaPartita}>
              Gioca di nuovo
            </Button>
          )}

            </div>
          )}
        </Card.Body>
      </Card>
      

      {/* pulsanti delle tratte */}
      <h4 className="text-center mb-3">Costruisci il percorso tratta per tratta</h4>
      <Card className="shadow-sm p-4 bg-light border-success mb-4">
        <div className="d-flex flex-wrap justify-content-center gap-2">
          {bottoniMescolati.map((tratta, idx) => {
            // Controlla se la tratta è nell'array delle selezionate
            const isSelected = percorsoTratte.some(
              (t) => t.stazione_partenza === tratta.stazione_partenza && t.stazione_arrivo === tratta.stazione_arrivo
            );
            const trattaColor = getColoreLinea(tratta.nome_linea);
            
            return (
              <Button
                key={idx}
                onClick={() => handleTrattaClick(tratta)}
                className="shadow-sm"
                style={{
                  backgroundColor: inGioco ?( isSelected ? '#8c8686'  : '#ffffff'):trattaColor,
                  color: inGioco?( isSelected ? '#ffffff': '#8c8686') : '#000000',
                  borderColor: inGioco ?  '#000000': trattaColor,
                  borderWidth: '2px',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  padding: '8px 16px',
                  cursor: inGioco ? 'pointer' : 'not-allowed', // Disabilita visivamente se non sei in gioco
                  opacity: inGioco ? 1 : 0.6 // Rende semi-trasparente se non sei in gioco
                }}
                disabled={!inGioco} // Disabilita se non sei in gioco
              >
                {getNomeStazione(tratta.stazione_partenza)} ↔ {getNomeStazione(tratta.stazione_arrivo)}
              </Button>
            );
          })}
        </div>
      </Card>


      <h2 className="text-center mb-4">Mappa delle Stazioni</h2>
      
      <Card className="shadow-sm mb-4 overflow-hidden border-black">
        {/* mappa centrata interattiva, per la centratura è necessario impostare la larghezza e l'altrezza*/}
        <div style={{ width: '100%', height: '600px', backgroundColor: '#f8f9fa', display: 'flex', justifyContent: 'center' }}>
          <ForceGraph2D
            ref={fgRef} 
            height={600}
            graphData={graphData} 
            nodeCanvasObject={drawNode} 
            minZoom={0.8}
            maxZoom={4}


            linkColor={(link) => {
              const color = getColoreLinea(link.linea);
              
              if (inGioco) return 'transparent'; // Durante il gioco le tratte sono invisibili
              
              if (risultato) {
                // Se la partita è persa, la mappa torna subito a colori
                if (!risultato.valido) return color;
                
                // Se questa tratta è nel percorso animato (partita vinta), ritorna il colore
                if (isTrattaAnimata(link)) return color;
                
                // Se l'animazione è finita, mostra di nuovo tutto il resto della mappa
                const animazioneFinita = stepVisualizzazione >= risultato.cronistoria.length;
                if (animazioneFinita) return color; 
                
                // Altrimenti (mentre l'animazione è in corso) rimane trasparente
                return 'transparent'; 
              }
              
              return color; 
            }} 
            linkWidth={(link) => {
              if (inGioco) return 0;
              
              if (risultato) {
                // Se la partita è persa, usa la tua funzione checkLinkSelected 
                // per evidenziare (spessore 5) tutto il percorso tentato dall'utente.
                if (!risultato.valido) {
                  return checkLinkSelected(link) ? 5 : 2;
                }
                
                // Il percorso dell'utente sbloccato è spesso 5
                if (isTrattaAnimata(link)) return 5;
                
                // Se l'animazione è finita, le altre tratte riappiaiono con spessore 2
                const animazioneFinita = stepVisualizzazione >= risultato.cronistoria.length;
                if (animazioneFinita) return 2;
                
                // Durante l'animazione, il resto della mappa è nascosto
                return 0;
              }
              
              return 2; // Mappa di default
          }}
            
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
          />
        </div>
      </Card>
    </Container>
  );
}

export default Gioco;