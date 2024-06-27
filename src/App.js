import React, { useRef, useState, useEffect } from 'react';
import SimplePeer from 'simple-peer';
import { Button, TextField, Box, Typography } from '@mui/material';

const App = () => {
  const [myStream, setMyStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [myID, setMyID] = useState('');
  const [peerSignal, setPeerSignal] = useState('');
  const [callID, setCallID] = useState('');

  const myVideo = useRef();
  const peerVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setMyStream(stream);
        if (myVideo.current) {
          myVideo.current.srcObject = stream;
        }
      });

    setMyID(generateID());
  }, []);

  const generateID = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const createCall = () => {
    const newPeer = new SimplePeer({
      initiator: true,
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

    setPeer(newPeer);
  };

  const joinCall = () => {
    const newPeer = new SimplePeer({
      initiator: false,
      stream: myStream,
    });

    newPeer.on('signal', data => {
      // Enviamos la señal generada al otro lado
      setPeerSignal(JSON.stringify(data));
    });

    newPeer.on('stream', stream => {
      if (peerVideo.current) {
        peerVideo.current.srcObject = stream;
      }
    });

    // Intentamos establecer la conexión con la señal recibida
    try {
      newPeer.signal(JSON.parse(peerSignal));
      setPeer(newPeer);
      setCallAccepted(true);
    } catch (error) {
      console.error('Error al intentar unirse a la llamada:', error);
      // Manejar el error según sea necesario
    }
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
        <Button variant="contained" color="secondary" onClick={joinCall} disabled={!peerSignal}>
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
        />
      </Box>
    </Box>
  );
};

export default App;
