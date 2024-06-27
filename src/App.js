import React, { useRef, useState, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import { Button, TextField, Box, Typography } from '@mui/material';
import process from 'process'; // Importar process

const App = () => {
  const [myStream, setMyStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [myID, setMyID] = useState('');
  const [peerSignal, setPeerSignal] = useState('');
  const [incomingSignal, setIncomingSignal] = useState(null);
  const [callID, setCallID] = useState('');
  const [joinError, setJoinError] = useState('');

  const myVideo = useRef();
  const peerVideo = useRef();
  const peerRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setMyStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      })
      .catch(error => {
        console.error('Error al acceder a la cámara y al micrófono:', error);
      });

    setMyID(generateID());
  }, []);

  const generateID = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const createCall = () => {
    const newPeer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: myStream,
    });

    newPeer.on('signal', data => {
      setCallID(JSON.stringify(data));
    });

    newPeer.on('stream', stream => {
      if (peerVideo.current) {
        peerVideo.current.srcObject = stream;
      }
    });

    newPeer.on('error', (err) => {
      console.error('Error en la conexión:', err);
      setJoinError('Error al crear la llamada.');
    });

    setPeer(newPeer);
    peerRef.current = newPeer;
  };

  const joinCall = () => {
    if (!peerSignal) {
      setJoinError('Ingrese una ID válida para unirse a la llamada.');
      return;
    }

    const newPeer = new SimplePeer({
      initiator: false,
      trickle: false,
      stream: myStream,
    });

    newPeer.on('signal', data => {
      setPeerSignal(JSON.stringify(data));
    });

    newPeer.on('stream', stream => {
      if (peerVideo.current) {
        peerVideo.current.srcObject = stream;
      }
    });

    newPeer.on('connect', () => {
      console.log('Conexión establecida.');
      setCallAccepted(true);
    });

    newPeer.on('error', (err) => {
      console.error('Error en la conexión:', err);
      setJoinError('Error al intentar unirse a la llamada.');
    });

    newPeer.signal(JSON.parse(peerSignal));
    setPeer(newPeer);
    peerRef.current = newPeer;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Videollamada
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
        <video playsInline muted ref={myVideo} autoPlay style={{ width: "300px" }} />
        <video playsInline ref={peerVideo} autoPlay style={{ width: "300px" }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={createCall}>
          Crear llamada
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={joinCall}
          disabled={!callID || callAccepted}
        >
          Unirse a la llamada
        </Button>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6">Tu ID:</Typography>
        <TextField
          fullWidth
          variant="outlined"
          readOnly
          value={myID}
          sx={{ mb: 2 }}
        />
        {callAccepted ? (
          <Typography variant="h6">ID de la otra persona:</Typography>
        ) : (
          <Typography variant="h6">Pegue la ID de la otra persona aquí:</Typography>
        )}
        <TextField
          fullWidth
          variant="outlined"
          value={peerSignal}
          onChange={(e) => setPeerSignal(e.target.value)}
          disabled={callAccepted}
          error={!!joinError}
          helperText={joinError}
        />
      </Box>
    </Box>
  );
};

export default App;
