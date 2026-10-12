import React from 'react';

function Homepage() {
  return (
    <div>
      <h1>Benvenuto a Ultima Corsa!</h1>

      {/* Ascii art colorata tramite AI gemini e presa da https://ascii.co.uk/art/metro */}
      {/* Treno 2 */}
      <pre style={{ fontFamily: 'monospace', lineHeight: '1.2', fontSize: '28px', fontWeight: 'bold' }}>
        {/* Tetto e Pantografo (Grigio) */}
        <span style={{ color: 'gray' }}>{`_______\n`}</span>
        <span style={{ color: 'gray' }}>{`\\   /\n`}</span>
        <span style={{ color: 'gray' }}>{`|\n`}</span>
        <span style={{ color: 'gray' }}>{`___|___\n`}</span>
        <span style={{ color: 'gray' }}>{`_|_______|_\n`}</span>
        {/* Corpo del vagone */}
        <span style={{ color: '#ffa500' }}>{`/ |[ `}</span><span style={{ color: 'black' }}>{`PoliTo`}</span><span style={{ color: '#ffa500' }}>{` ]| \\\n`}</span>
        <span style={{ color: '#ffa500' }}>{`| |     |     | |\n`}</span>
        <span style={{ color: '#ffa500' }}>{`| |     |     | |\n`}</span>
        <span style={{ color: '#ffa500' }}>{`| |_____|_____| |\n`}</span>
        <span style={{ color: '#8f887d' }}>{`|\\|====(M)====|/|\n`}</span>
        <span style={{ color: '#ffa500' }}>{`|\\[][]_____[][]/|\n`}</span>
        <span style={{ color: '#ffa500' }}>{`|/  |0 [ ]  |  \\|\n`}</span>
        {/* Binari e ruote */}
        <span style={{ color: '#000000' }}>{`==((       ))==\n`}</span>
        <span style={{ color: '#6e3e12' }}>{`===//=========\\\\===\n`}</span>
        <span style={{ color: '#6e3e12' }}>{`===//===========\\\\===`}</span>
      </pre>
    </div>



  );
}

export default Homepage;