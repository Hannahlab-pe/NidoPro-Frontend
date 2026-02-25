import React, { useState, useEffect } from 'react';
import { 
  Smile, 
  Star, 
  RefreshCw, 
  CheckCircle,
  X,
  Calculator,
  Palette,
  Brain,
  Lightbulb,
  Trophy,
  Heart,
  Maximize,
  Minimize,
  Triangle,
  Circle,
  Square,
  Zap,
  Music,
  Book
} from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';

const Juegos = () => {
  const [juegoActivo, setJuegoActivo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Funciones para pantalla completa
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Componente de Juego de Conteo
  const JuegoConteo = () => {
    const [objetos, setObjetos] = useState([]);
    const [respuesta, setRespuesta] = useState('');
    const [puntos, setPuntos] = useState(0);
    const [mensaje, setMensaje] = useState('');
    const [correcto, setCorrecto] = useState(false);
    const [respuestaCorrecta, setRespuestaCorrecta] = useState(0);

    const tiposObjetos = [
      { emoji: '🍎', nombre: 'manzanas' },
      { emoji: '🍌', nombre: 'plátanos' },
      { emoji: '🍊', nombre: 'naranjas' },
      { emoji: '⭐', nombre: 'estrellas' },
      { emoji: '🌸', nombre: 'flores' },
      { emoji: '🎈', nombre: 'globos' },
      { emoji: '🐱', nombre: 'gatos' },
      { emoji: '🌈', nombre: 'arcoíris' }
    ];

    const generarNuevoConteo = () => {
      const tipoSeleccionado = tiposObjetos[Math.floor(Math.random() * tiposObjetos.length)];
      const cantidad = Math.floor(Math.random() * 8) + 3; // Entre 3 y 10 objetos
      
      // Crear array con los objetos a contar
      const objetosArray = Array(cantidad).fill(tipoSeleccionado);
      
      // Agregar algunos Tung Tung Sahur escondidos ocasionalmente
      const objetosConSorpresas = [...objetosArray];
      if (Math.random() < 0.3) { // 30% de probabilidad
        const cantidadSorpresas = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < cantidadSorpresas; i++) {
          objetosConSorpresas.push({ emoji: '🎭', nombre: 'Tung Tung', esEspecial: true });
        }
      }
      
      // Mezclar los objetos
      const objetosMezclados = objetosConSorpresas.sort(() => Math.random() - 0.5);
      
      setObjetos(objetosMezclados);
      setRespuestaCorrecta(cantidad);
      setRespuesta('');
      setMensaje('');
      setCorrecto(false);
    };

    const verificarRespuesta = () => {
      if (parseInt(respuesta) === respuestaCorrecta) {
        setPuntos(puntos + 1);
        setMensaje('¡Excelente! 🎉 ¡Contaste correctamente!');
        setCorrecto(true);
        setTimeout(() => {
          generarNuevoConteo();
        }, 2000);
      } else {
        setMensaje(`Inténtalo de nuevo. Cuenta bien los ${objetos[0]?.nombre || 'objetos'}`);
        setCorrecto(false);
      }
    };

    useEffect(() => {
      generarNuevoConteo();
    }, []);

    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-blue-600 mb-2">🔢 Juego de Conteo</h3>
          <p className="text-lg text-gray-600">Puntos: <span className="font-bold text-green-600">{puntos}</span></p>
        </div>
        
        <div className="text-center mb-6">
          <p className="text-xl font-semibold text-gray-700 mb-4">
            ¿Cuántos {objetos.length > 0 && objetos[0].nombre} ves?
          </p>
          
          <div className="bg-blue-50 p-6 rounded-lg mb-6 flex flex-wrap justify-center gap-3 min-h-[200px] items-center">
            {objetos.map((objeto, index) => (
              <div key={index} className="relative">
                {objeto.esEspecial ? (
                  <img 
                    src="https://res.cloudinary.com/dhdpp8eq2/image/upload/v1756327657/Tung-Tung-Tung-Sahur-PNG-Photos_ybnh2k.png"
                    alt="Tung Tung Sahur"
                    className="w-16 h-16 object-contain opacity-80 hover:opacity-100 transition-opacity hover:scale-110"
                  />
                ) : (
                  <span className="text-4xl hover:scale-110 transition-transform cursor-pointer">
                    {objeto.emoji}
                  </span>
                )}
              </div>
            ))}
          </div>
          
          <input
            type="number"
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            className="w-24 h-16 text-3xl text-center border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
            placeholder="?"
            min="0"
            max="20"
          />
        </div>

        <div className="text-center mb-4">
          <button
            onClick={verificarRespuesta}
            disabled={!respuesta}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Verificar
          </button>
        </div>

        {mensaje && (
          <div className={`text-center p-3 rounded-lg ${correcto ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {mensaje}
          </div>
        )}

        <div className="text-center mt-6">
          <button
            onClick={generarNuevoConteo}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
          >
            Nuevos Objetos
          </button>
        </div>
      </div>
    );
  };

  // Componente de Juego de Memoria de Colores (MEJORADO)
  const JuegoMemoriaColores = () => {
    const [secuencia, setSecuencia] = useState([]);
    const [secuenciaUsuario, setSecuenciaUsuario] = useState([]);
    const [mostrandoSecuencia, setMostrandoSecuencia] = useState(false);
    const [colorActivo, setColorActivo] = useState(null);
    const [nivel, setNivel] = useState(1);
    const [mensaje, setMensaje] = useState('¡Presiona INICIAR para comenzar!');
    const [juegoIniciado, setJuegoIniciado] = useState(false);

    const colores = [
      { id: 'rojo', color: 'bg-red-500', colorActivo: 'bg-red-300', nombre: 'Rojo' },
      { id: 'azul', color: 'bg-blue-500', colorActivo: 'bg-blue-300', nombre: 'Azul' },
      { id: 'verde', color: 'bg-green-500', colorActivo: 'bg-green-300', nombre: 'Verde' },
      { id: 'amarillo', color: 'bg-yellow-500', colorActivo: 'bg-yellow-300', nombre: 'Amarillo' }
    ];

    const iniciarJuego = () => {
      const nuevaSecuencia = [colores[Math.floor(Math.random() * colores.length)].id];
      setSecuencia(nuevaSecuencia);
      setSecuenciaUsuario([]);
      setNivel(1);
      setJuegoIniciado(true);
      mostrarSecuencia(nuevaSecuencia);
    };

    const mostrarSecuencia = (seq) => {
      setMostrandoSecuencia(true);
      setMensaje('Observa la secuencia...');
      
      seq.forEach((colorId, index) => {
        setTimeout(() => {
          setColorActivo(colorId);
          setTimeout(() => {
            setColorActivo(null);
            if (index === seq.length - 1) {
              setTimeout(() => {
                setMostrandoSecuencia(false);
                setMensaje('¡Tu turno! Repite la secuencia');
              }, 500);
            }
          }, 600);
        }, index * 1000);
      });
    };

    const clickColor = (colorId) => {
      if (mostrandoSecuencia) return;
      
      // Efecto visual del click
      setColorActivo(colorId);
      setTimeout(() => setColorActivo(null), 200);
      
      const nuevaSecuenciaUsuario = [...secuenciaUsuario, colorId];
      setSecuenciaUsuario(nuevaSecuenciaUsuario);

      if (nuevaSecuenciaUsuario[nuevaSecuenciaUsuario.length - 1] !== secuencia[nuevaSecuenciaUsuario.length - 1]) {
        setMensaje('¡Incorrecto! Inténtalo de nuevo');
        setTimeout(() => {
          setSecuenciaUsuario([]);
          mostrarSecuencia(secuencia);
        }, 1500);
        return;
      }

      if (nuevaSecuenciaUsuario.length === secuencia.length) {
        setNivel(nivel + 1);
        setMensaje(`¡Excelente! Nivel ${nivel + 1}`);
        const nuevaSecuencia = [...secuencia, colores[Math.floor(Math.random() * colores.length)].id];
        setSecuencia(nuevaSecuencia);
        setSecuenciaUsuario([]);
        
        setTimeout(() => {
          mostrarSecuencia(nuevaSecuencia);
        }, 2000);
      }
    };

    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-purple-600 mb-2">🎨 Memoria de Colores</h3>
          <p className="text-lg text-gray-600">Nivel: <span className="font-bold text-purple-600">{nivel}</span></p>
        </div>

        <div className="text-center mb-6">
          <p className="text-lg font-medium text-gray-700">{mensaje}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {colores.map((color) => {
            const esActivo = colorActivo === color.id;
            return (
              <button
                key={color.id}
                onClick={() => clickColor(color.id)}
                disabled={mostrandoSecuencia && colorActivo !== color.id}
                className={`h-20 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed ${
                  esActivo ? color.colorActivo + ' scale-110 ring-4 ring-white' : color.color
                }`}
              >
                <span className="text-white font-bold">{color.nombre}</span>
              </button>
            );
          })}
        </div>

        {/* Tung Tung Sahur escondido */}
        <div className="flex justify-center mb-4">
          <img 
            src="https://res.cloudinary.com/dhdpp8eq2/image/upload/v1756327657/Tung-Tung-Tung-Sahur-PNG-Photos_ybnh2k.png"
            alt="Tung Tung Sahur"
            className="w-12 h-12 opacity-40 hover:opacity-80 transition-opacity cursor-pointer hover:scale-110"
          />
        </div>

        <div className="text-center">
          <button
            onClick={iniciarJuego}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-semibold"
          >
            {juegoIniciado ? 'Reiniciar' : 'Iniciar'}
          </button>
        </div>
      </div>
    );
  };

  // Componente de Juego de Encuentra las Parejas (CON TUNG TUNG)
  const JuegoEncontrarParejas = () => {
    const [cartas, setCartas] = useState([]);
    const [cartasVolteadas, setCartasVolteadas] = useState([]);
    const [parejasEncontradas, setParejasEncontradas] = useState([]);
    const [puntos, setPuntos] = useState(0);
    const [juegoCompleto, setJuegoCompleto] = useState(false);
    const [tungTungEncontrado, setTungTungEncontrado] = useState(false);

    const emojis = ['🐱', '🐶', '🐰', '🦊', '🐸', '🐻'];

    const inicializarJuego = () => {
      // Crear parejas normales
      let parejasCartas = [...emojis, ...emojis];
      
      // Agregar un par especial de Tung Tung Sahur
      parejasCartas.push('tungTung', 'tungTung');
      
      const cartasJuego = parejasCartas
        .sort(() => Math.random() - 0.5)
        .map((item, index) => ({
          id: index,
          emoji: item === 'tungTung' ? '🎭' : item,
          esTungTung: item === 'tungTung',
          volteada: false,
          encontrada: false
        }));
      
      setCartas(cartasJuego);
      setCartasVolteadas([]);
      setParejasEncontradas([]);
      setPuntos(0);
      setJuegoCompleto(false);
      setTungTungEncontrado(false);
    };

    const voltearCarta = (id) => {
      if (cartasVolteadas.length >= 2) return;
      if (cartasVolteadas.includes(id)) return;
      if (parejasEncontradas.some(carta => carta.id === id)) return;

      const nuevasVolteadas = [...cartasVolteadas, id];
      setCartasVolteadas(nuevasVolteadas);

      if (nuevasVolteadas.length === 2) {
        const carta1 = cartas.find(c => c.id === nuevasVolteadas[0]);
        const carta2 = cartas.find(c => c.id === nuevasVolteadas[1]);

        if (carta1.emoji === carta2.emoji) {
          const puntosGanados = carta1.esTungTung ? 20 : 10;
          setPuntos(puntos + puntosGanados);
          
          if (carta1.esTungTung) {
            setTungTungEncontrado(true);
          }
          
          const nuevasEncontradas = [...parejasEncontradas, carta1, carta2];
          setParejasEncontradas(nuevasEncontradas);
          
          if (nuevasEncontradas.length === cartas.length) {
            setJuegoCompleto(true);
          }
        }

        setTimeout(() => {
          setCartasVolteadas([]);
        }, 1000);
      }
    };

    useEffect(() => {
      inicializarJuego();
    }, []);

    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-green-600 mb-2">🧩 Encuentra las Parejas</h3>
          <p className="text-lg text-gray-600">
            Puntos: <span className="font-bold text-green-600">{puntos}</span>
            {tungTungEncontrado && <span className="ml-4 text-purple-600">¡Tung Tung encontrado! 🎭</span>}
          </p>
        </div>

        {juegoCompleto && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-center">
            {tungTungEncontrado ? 
              '¡Felicitaciones! ¡Completaste el juego y encontraste a Tung Tung Sahur! 🎉🎭' :
              '¡Felicitaciones! ¡Completaste el juego! 🎉'
            }
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 mb-6">
          {cartas.map((carta) => {
            const volteada = cartasVolteadas.includes(carta.id);
            const encontrada = parejasEncontradas.some(c => c.id === carta.id);
            
            return (
              <button
                key={carta.id}
                onClick={() => voltearCarta(carta.id)}
                className={`h-16 w-16 rounded-lg text-2xl font-bold transition-all duration-300 flex items-center justify-center ${
                  volteada || encontrada
                    ? carta.esTungTung 
                      ? 'bg-purple-200 border-2 border-purple-400' 
                      : 'bg-green-200 border-2 border-green-400'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              >
                {volteada || encontrada ? (
                  carta.esTungTung ? (
                    <img 
                      src="https://res.cloudinary.com/dhdpp8eq2/image/upload/v1756327657/Tung-Tung-Tung-Sahur-PNG-Photos_ybnh2k.png"
                      alt="Tung Tung Sahur"
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    carta.emoji
                  )
                ) : '?'}
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={inicializarJuego}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold"
          >
            Nuevo Juego
          </button>
        </div>
      </div>
    );
  };

  // Componente de Juego de Formas Geométricas
  const JuegoFormas = () => {
    const [formaActual, setFormaActual] = useState(null);
    const [opciones, setOpciones] = useState([]);
    const [puntos, setPuntos] = useState(0);
    const [mensaje, setMensaje] = useState('¡Elige la forma correcta!');
    const [correcto, setCorrecto] = useState(null);

    const formas = [
      { nombre: 'Círculo', emoji: '⭕', color: 'bg-red-400' },
      { nombre: 'Cuadrado', emoji: '⬜', color: 'bg-blue-400' },
      { nombre: 'Triángulo', emoji: '🔺', color: 'bg-green-400' },
      { nombre: 'Estrella', emoji: '⭐', color: 'bg-yellow-400' },
      { nombre: 'Corazón', emoji: '❤️', color: 'bg-pink-400' },
      { nombre: 'Rombo', emoji: '💎', color: 'bg-purple-400' }
    ];

    const generarNuevaPregunta = () => {
      const formaCorrecta = formas[Math.floor(Math.random() * formas.length)];
      const formasIncorrectas = formas.filter(f => f.nombre !== formaCorrecta.nombre);
      
      // Seleccionar 3 opciones incorrectas aleatorias
      const opcionesIncorrectas = [];
      while (opcionesIncorrectas.length < 3) {
        const opcion = formasIncorrectas[Math.floor(Math.random() * formasIncorrectas.length)];
        if (!opcionesIncorrectas.includes(opcion)) {
          opcionesIncorrectas.push(opcion);
        }
      }
      
      // Mezclar todas las opciones
      const todasLasOpciones = [formaCorrecta, ...opcionesIncorrectas].sort(() => Math.random() - 0.5);
      
      setFormaActual(formaCorrecta);
      setOpciones(todasLasOpciones);
      setMensaje('¡Elige la forma correcta!');
      setCorrecto(null);
    };

    const verificarRespuesta = (formaSeleccionada) => {
      if (formaSeleccionada.nombre === formaActual.nombre) {
        setPuntos(puntos + 1);
        setMensaje('¡Correcto! 🎉');
        setCorrecto(true);
        setTimeout(() => {
          generarNuevaPregunta();
        }, 1500);
      } else {
        setMensaje('¡Inténtalo de nuevo! 😊');
        setCorrecto(false);
      }
    };

    useEffect(() => {
      generarNuevaPregunta();
    }, []);

    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-indigo-600 mb-2">🔷 Juego de Formas</h3>
          <p className="text-lg text-gray-600">Puntos: <span className="font-bold text-indigo-600">{puntos}</span></p>
        </div>

        {formaActual && (
          <div className="text-center mb-8">
            <div className={`text-8xl mb-4 ${formaActual.color} rounded-lg p-4 inline-block`}>
              {formaActual.emoji}
            </div>
            <p className="text-xl font-semibold text-gray-700">
              ¿Qué forma es esta?
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {opciones.map((forma, index) => (
            <button
              key={index}
              onClick={() => verificarRespuesta(forma)}
              className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-4xl transition-colors"
            >
              {forma.emoji}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className={`text-lg font-semibold ${correcto === true ? 'text-green-600' : correcto === false ? 'text-red-600' : 'text-gray-700'}`}>
            {mensaje}
          </p>
        </div>
      </div>
    );
  };

  // Componente de Juego de Colores
  const JuegoColores = () => {
    const [colorActual, setColorActual] = useState(null);
    const [opciones, setOpciones] = useState([]);
    const [puntos, setPuntos] = useState(0);
    const [mensaje, setMensaje] = useState('¡Elige el color correcto!');
    const [correcto, setCorrecto] = useState(null);

    const colores = [
      { nombre: 'Rojo', color: 'bg-red-500', texto: 'text-red-600' },
      { nombre: 'Azul', color: 'bg-blue-500', texto: 'text-blue-600' },
      { nombre: 'Verde', color: 'bg-green-500', texto: 'text-green-600' },
      { nombre: 'Amarillo', color: 'bg-yellow-500', texto: 'text-yellow-600' },
      { nombre: 'Naranja', color: 'bg-orange-500', texto: 'text-orange-600' },
      { nombre: 'Morado', color: 'bg-purple-500', texto: 'text-purple-600' }
    ];

    const generarNuevaPregunta = () => {
      const colorCorrecto = colores[Math.floor(Math.random() * colores.length)];
      const coloresIncorrectos = colores.filter(c => c.nombre !== colorCorrecto.nombre);
      
      // Seleccionar 2 opciones incorrectas
      const opcionesIncorrectas = coloresIncorrectos.slice(0, 2);
      
      // Mezclar todas las opciones
      const todasLasOpciones = [colorCorrecto, ...opcionesIncorrectas].sort(() => Math.random() - 0.5);
      
      setColorActual(colorCorrecto);
      setOpciones(todasLasOpciones);
      setMensaje('¡Elige el color correcto!');
      setCorrecto(null);
    };

    const verificarRespuesta = (colorSeleccionado) => {
      if (colorSeleccionado.nombre === colorActual.nombre) {
        setPuntos(puntos + 1);
        setMensaje('¡Excelente! 🎨');
        setCorrecto(true);
        setTimeout(() => {
          generarNuevaPregunta();
        }, 1500);
      } else {
        setMensaje('¡Sigue intentando! 🌈');
        setCorrecto(false);
      }
    };

    useEffect(() => {
      generarNuevaPregunta();
    }, []);

    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-pink-600 mb-2">🎨 Juego de Colores</h3>
          <p className="text-lg text-gray-600">Puntos: <span className="font-bold text-pink-600">{puntos}</span></p>
        </div>

        {colorActual && (
          <div className="text-center mb-8">
            <div className={`w-24 h-24 ${colorActual.color} rounded-full mx-auto mb-4 shadow-lg`}></div>
            <p className="text-xl font-semibold text-gray-700">
              ¿Qué color es este?
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          {opciones.map((color, index) => (
            <button
              key={index}
              onClick={() => verificarRespuesta(color)}
              className={`w-20 h-20 ${color.color} rounded-full mx-auto shadow-lg hover:scale-110 transition-transform`}
            >
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className={`text-lg font-semibold ${correcto === true ? 'text-green-600' : correcto === false ? 'text-red-600' : 'text-gray-700'}`}>
            {mensaje}
          </p>
        </div>
      </div>
    );
  };

  // Componente de Juego de Animales
  const JuegoAnimales = () => {
    const [animalActual, setAnimalActual] = useState(null);
    const [opciones, setOpciones] = useState([]);
    const [puntos, setPuntos] = useState(0);
    const [mensaje, setMensaje] = useState('¡Encuentra el animal!');
    const [correcto, setCorrecto] = useState(null);

    const animales = [
      { nombre: 'Perro', emoji: '🐕', sonido: '¡Guau!' },
      { nombre: 'Gato', emoji: '🐱', sonido: '¡Miau!' },
      { nombre: 'Vaca', emoji: '🐄', sonido: '¡Muu!' },
      { nombre: 'Oveja', emoji: '🐑', sonido: '¡Bee!' },
      { nombre: 'Pato', emoji: '🦆', sonido: '¡Cuac!' },
      { nombre: 'Gallina', emoji: '🐔', sonido: '¡Cocorocó!' },
      { nombre: 'Cerdo', emoji: '🐷', sonido: '¡Oink!' },
      { nombre: 'Caballo', emoji: '🐎', sonido: '¡Relincho!' }
    ];

    const generarNuevaPregunta = () => {
      const animalCorrecto = animales[Math.floor(Math.random() * animales.length)];
      const animalesIncorrectos = animales.filter(a => a.nombre !== animalCorrecto.nombre);
      
      // Seleccionar 3 opciones incorrectas
      const opcionesIncorrectas = animalesIncorrectos.slice(0, 3);
      
      // Mezclar todas las opciones
      const todasLasOpciones = [animalCorrecto, ...opcionesIncorrectas].sort(() => Math.random() - 0.5);
      
      setAnimalActual(animalCorrecto);
      setOpciones(todasLasOpciones);
      setMensaje('¡Encuentra el animal!');
      setCorrecto(null);
    };

    const verificarRespuesta = (animalSeleccionado) => {
      if (animalSeleccionado.nombre === animalActual.nombre) {
        setPuntos(puntos + 1);
        setMensaje(`${animalActual.sonido} ¡Correcto! 🎉`);
        setCorrecto(true);
        setTimeout(() => {
          generarNuevaPregunta();
        }, 2000);
      } else {
        setMensaje('¡Inténtalo de nuevo! 🐾');
        setCorrecto(false);
      }
    };

    useEffect(() => {
      generarNuevaPregunta();
    }, []);

    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-orange-600 mb-2">🐾 Juego de Animales</h3>
          <p className="text-lg text-gray-600">Puntos: <span className="font-bold text-orange-600">{puntos}</span></p>
        </div>

        {animalActual && (
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{animalActual.emoji}</div>
            <p className="text-xl font-semibold text-gray-700">
              ¿Dónde está el {animalActual.nombre.toLowerCase()}?
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6">
          {opciones.map((animal, index) => (
            <button
              key={index}
              onClick={() => verificarRespuesta(animal)}
              className="bg-gray-100 hover:bg-gray-200 p-6 rounded-lg text-4xl transition-colors hover:scale-105"
            >
              {animal.emoji}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className={`text-lg font-semibold ${correcto === true ? 'text-green-600' : correcto === false ? 'text-red-600' : 'text-gray-700'}`}>
            {mensaje}
          </p>
        </div>
      </div>
    );
  };

  // Componente de Juego de Números
  const JuegoNumeros = () => {
    const [numeroActual, setNumeroActual] = useState(0);
    const [opciones, setOpciones] = useState([]);
    const [puntos, setPuntos] = useState(0);
    const [mensaje, setMensaje] = useState('¡Elige el número correcto!');
    const [correcto, setCorrecto] = useState(null);

    const generarNuevaPregunta = () => {
      const numeroCorrecto = Math.floor(Math.random() * 10) + 1; // 1-10
      const opcionesIncorrectas = [];
      
      // Generar opciones incorrectas
      while (opcionesIncorrectas.length < 3) {
        const opcion = Math.floor(Math.random() * 10) + 1;
        if (opcion !== numeroCorrecto && !opcionesIncorrectas.includes(opcion)) {
          opcionesIncorrectas.push(opcion);
        }
      }
      
      // Mezclar todas las opciones
      const todasLasOpciones = [numeroCorrecto, ...opcionesIncorrectas].sort(() => Math.random() - 0.5);
      
      setNumeroActual(numeroCorrecto);
      setOpciones(todasLasOpciones);
      setMensaje('¡Elige el número correcto!');
      setCorrecto(null);
    };

    const verificarRespuesta = (numeroSeleccionado) => {
      if (numeroSeleccionado === numeroActual) {
        setPuntos(puntos + 1);
        setMensaje('¡Número correcto! ⭐');
        setCorrecto(true);
        setTimeout(() => {
          generarNuevaPregunta();
        }, 1500);
      } else {
        setMensaje('¡Sigue practicando! 🔢');
        setCorrecto(false);
      }
    };

    useEffect(() => {
      generarNuevaPregunta();
    }, []);

    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-teal-600 mb-2">🔢 Juego de Números</h3>
          <p className="text-lg text-gray-600">Puntos: <span className="font-bold text-teal-600">{puntos}</span></p>
        </div>

        <div className="text-center mb-8">
          <div className="text-8xl mb-4 font-bold text-teal-600">
            {numeroActual}
          </div>
          <p className="text-xl font-semibold text-gray-700">
            ¿Qué número ves?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {opciones.map((numero, index) => (
            <button
              key={index}
              onClick={() => verificarRespuesta(numero)}
              className="bg-teal-100 hover:bg-teal-200 p-6 rounded-lg text-4xl font-bold text-teal-700 transition-colors hover:scale-105"
            >
              {numero}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className={`text-lg font-semibold ${correcto === true ? 'text-green-600' : correcto === false ? 'text-red-600' : 'text-gray-700'}`}>
            {mensaje}
          </p>
        </div>
      </div>
    );
  };

  // Componente de Juego de Vocales
  const JuegoVocales = () => {
    const [letraActual, setLetraActual] = useState('');
    const [opciones, setOpciones] = useState([]);
    const [puntos, setPuntos] = useState(0);
    const [mensaje, setMensaje] = useState('¡Encuentra la vocal!');
    const [correcto, setCorrecto] = useState(null);

    const vocales = ['A', 'E', 'I', 'O', 'U'];
    const consonantes = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

    const generarNuevaPregunta = () => {
      const esVocal = Math.random() < 0.7; // 70% vocales, 30% consonantes
      let letraCorrecta;
      
      if (esVocal) {
        letraCorrecta = vocales[Math.floor(Math.random() * vocales.length)];
        setMensaje('¡Encuentra la vocal!');
      } else {
        letraCorrecta = consonantes[Math.floor(Math.random() * consonantes.length)];
        setMensaje('¡Encuentra la consonante!');
      }
      
      // Generar opciones mezcladas
      const todasLasLetras = esVocal ? vocales : consonantes;
      const letrasIncorrectas = todasLasLetras.filter(l => l !== letraCorrecta);
      
      // Seleccionar 3 opciones incorrectas
      const opcionesIncorrectas = letrasIncorrectas.slice(0, 3);
      
      // Mezclar todas las opciones
      const todasLasOpciones = [letraCorrecta, ...opcionesIncorrectas].sort(() => Math.random() - 0.5);
      
      setLetraActual(letraCorrecta);
      setOpciones(todasLasOpciones);
      setCorrecto(null);
    };

    const verificarRespuesta = (letraSeleccionada) => {
      if (letraSeleccionada === letraActual) {
        setPuntos(puntos + 1);
        setMensaje('¡Letra correcta! 📚');
        setCorrecto(true);
        setTimeout(() => {
          generarNuevaPregunta();
        }, 1500);
      } else {
        setMensaje('¡Inténtalo de nuevo! ✏️');
        setCorrecto(false);
      }
    };

    useEffect(() => {
      generarNuevaPregunta();
    }, []);

    return (
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-cyan-600 mb-2">📚 Juego de Letras</h3>
          <p className="text-lg text-gray-600">Puntos: <span className="font-bold text-cyan-600">{puntos}</span></p>
        </div>

        <div className="text-center mb-8">
          <div className="text-8xl mb-4 font-bold text-cyan-600 bg-cyan-50 rounded-lg p-8 inline-block">
            {letraActual}
          </div>
          <p className="text-xl font-semibold text-gray-700">
            {mensaje}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {opciones.map((letra, index) => (
            <button
              key={index}
              onClick={() => verificarRespuesta(letra)}
              className="bg-cyan-100 hover:bg-cyan-200 p-6 rounded-lg text-4xl font-bold text-cyan-700 transition-colors hover:scale-105"
            >
              {letra}
            </button>
          ))}
        </div>

        <div className="text-center">
          <p className={`text-lg font-semibold ${correcto === true ? 'text-green-600' : correcto === false ? 'text-red-600' : 'text-gray-700'}`}>
            {mensaje}
          </p>
        </div>
      </div>
    );
  };

  // Lista de juegos disponibles
  const juegosDisponibles = [
    {
      id: 'conteo',
      titulo: 'Juego de Conteo',
      descripcion: 'Cuenta objetos y aprende números',
      icono: <Calculator className="w-8 h-8" />,
      color: 'bg-blue-500',
      componente: <JuegoConteo />
    },
    {
      id: 'memoria',
      titulo: 'Memoria de Colores',
      descripcion: 'Desarrolla tu memoria',
      icono: <Palette className="w-8 h-8" />,
      color: 'bg-purple-500',
      componente: <JuegoMemoriaColores />
    },
    {
      id: 'parejas',
      titulo: 'Encuentra las Parejas',
      descripcion: 'Juego de concentración',
      icono: <Brain className="w-8 h-8" />,
      color: 'bg-green-500',
      componente: <JuegoEncontrarParejas />
    },
    {
      id: 'formas',
      titulo: 'Juego de Formas',
      descripcion: 'Aprende formas geométricas',
      icono: <Triangle className="w-8 h-8" />,
      color: 'bg-indigo-500',
      componente: <JuegoFormas />
    },
    {
      id: 'colores',
      titulo: 'Juego de Colores',
      descripcion: 'Identifica y nombra colores',
      icono: <Palette className="w-8 h-8" />,
      color: 'bg-pink-500',
      componente: <JuegoColores />
    },
    {
      id: 'animales',
      titulo: 'Juego de Animales',
      descripcion: 'Conoce animales y sus sonidos',
      icono: <Smile className="w-8 h-8" />,
      color: 'bg-orange-500',
      componente: <JuegoAnimales />
    },
    {
      id: 'numeros',
      titulo: 'Juego de Números',
      descripcion: 'Reconoce números del 1 al 10',
      icono: <Zap className="w-8 h-8" />,
      color: 'bg-teal-500',
      componente: <JuegoNumeros />
    },
    {
      id: 'letras',
      titulo: 'Juego de Letras',
      descripcion: 'Aprende vocales y consonantes',
      icono: <Book className="w-8 h-8" />,
      color: 'bg-cyan-500',
      componente: <JuegoVocales />
    }
  ];

  if (juegoActivo) {
    return (
      <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : 'min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6'}`}>
        <div className={`max-w-4xl mx-auto ${isFullscreen ? 'w-full h-full p-6' : ''}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Juegos Educativos</h1>
              <p className="text-sm text-blue-600 font-medium">🌟 EDA - Educación que Inspira</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleFullscreen}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                {isFullscreen ? "Salir" : "Pantalla Completa"}
              </button>
              <button
                onClick={() => setJuegoActivo(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Volver al Menú
              </button>
            </div>
          </div>
          
          {juegoActivo.componente}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Juegos Educativos"
        theme="green"
        actions={
          <button
            onClick={toggleFullscreen}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            <span>{isFullscreen ? "Salir" : "Pantalla completa"}</span>
          </button>
        }
      />
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white p-6' : 'bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6'}`}>
      <div className={`max-w-6xl mx-auto ${isFullscreen ? 'w-full h-full' : ''}`}>

        {/* Juegos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {juegosDisponibles.map((juego) => (
            <div
              key={juego.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden"
              onClick={() => setJuegoActivo(juego)}
            >
              <div className={`${juego.color} p-6 text-white text-center`}>
                <div className="flex justify-center mb-4">
                  {juego.icono}
                </div>
                <h3 className="text-2xl font-bold mb-2">{juego.titulo}</h3>
                <p className="text-sm opacity-90">{juego.descripcion}</p>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-center">
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors">
                    <Star className="w-4 h-4" />
                    ¡Jugar Ahora!
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tips para profesores */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <Lightbulb className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Tips para Profesores</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Motivación</h3>
              <p className="text-gray-600 text-sm">Celebra los logros y anima a seguir intentando</p>
            </div>
            
            <div className="text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Paciencia</h3>
              <p className="text-gray-600 text-sm">Cada niño aprende a su propio ritmo</p>
            </div>
            
            <div className="text-center">
              <Smile className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-800 mb-2">Diversión</h3>
              <p className="text-gray-600 text-sm">El aprendizaje es más efectivo cuando es divertido</p>
            </div>
          </div>
        </div>

        {/* Easter Egg - Tung Tung Sahur escondido en el footer */}
        <div className="mt-8 text-center">
          <img 
            src="https://res.cloudinary.com/dhdpp8eq2/image/upload/v1756327657/Tung-Tung-Tung-Sahur-PNG-Photos_ybnh2k.png"
            alt="Tung Tung Sahur"
            className="w-10 h-10 mx-auto opacity-20 hover:opacity-70 transition-opacity cursor-pointer hover:scale-125"
            onClick={() => alert('¡Encontraste a Tung Tung Sahur! 🎭')}
          />
        </div>
      </div>
      </div>
    </div>
  );
};

export default Juegos;