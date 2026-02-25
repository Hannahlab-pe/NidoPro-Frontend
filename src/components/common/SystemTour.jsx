import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { HelpCircle } from 'lucide-react';

const SystemTour = () => {
  useEffect(() => {
    // Inyectar estilos personalizados
    const style = document.createElement('style');
    style.textContent = `
      .driver-popover {
        --driver-popover-background: #ffffff;
        --driver-popover-border: #3b82f6;
        --driver-popover-title-color: #1e293b;
        --driver-popover-description-color: #475569;
        --driver-popover-close-color: #64748b;
        --driver-popover-arrow-size: 10px;
        --driver-popover-arrow-side-offset: 12px;
        --driver-popover-z-index: 10000;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border: 2px solid var(--driver-popover-border);
        border-radius: 16px;
        box-shadow: 0 20px 50px rgba(59, 130, 246, 0.15),
                    0 10px 25px rgba(0, 0, 0, 0.08);
        max-width: 450px;
        padding: 24px;
      }
      
      .driver-popover-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--driver-popover-title-color);
        margin-bottom: 12px;
        line-height: 1.4;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .driver-popover-description {
        font-size: 15px;
        line-height: 1.7;
        color: var(--driver-popover-description-color);
        margin-bottom: 20px;
        font-weight: 400;
      }
      
      .driver-popover-footer {
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: space-between;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
      }
      
      .driver-popover-btn {
        padding: 10px 20px;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      }
      
      .driver-popover-next-btn {
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      }
      
      .driver-popover-next-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
      }
      
      .driver-popover-prev-btn {
        background: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
      }
      
      .driver-popover-prev-btn:hover {
        background: #e2e8f0;
        transform: translateY(-1px);
      }
      
      .driver-popover-close-btn {
        color: #dc2626;
        padding: 8px 16px;
        background: #fef2f2;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        border: 1px solid #fee2e2;
        transition: all 0.2s;
      }
      
      .driver-popover-close-btn:hover {
        background: #fee2e2;
        border-color: #fecaca;
      }
      
      .driver-active-element {
        position: relative;
        z-index: 9999 !important;
        box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3) !important;
        border-radius: 8px !important;
        transition: all 0.3s ease !important;
        filter: none !important;
        backdrop-filter: none !important;
      }
      
      .driver-overlay {
        background: rgba(15, 23, 42, 0.25) !important;
        z-index: 9998;
        backdrop-filter: none !important;
        filter: none !important;
      }
      
      .driver-popover-progress-text {
        font-size: 13px;
        color: #64748b;
        font-weight: 600;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      /* Animación de entrada */
      @keyframes driver-popover-fade-in {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .driver-popover {
        animation: driver-popover-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Efecto de brillo en el elemento activo */
      @keyframes driver-highlight-pulse {
        0%, 100% {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
        }
        50% {
          box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.4);
        }
      }
      
      .driver-active-element {
        animation: driver-highlight-pulse 2s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ['next', 'previous', 'close'],
      steps: [
        {
          element: 'body',
          popover: {
            title: '👋 ¡Bienvenido a NidoPro!',
            description: 'Te mostraré cómo configurar tu sistema paso a paso. Este proceso debe hacerse en orden para que todo funcione correctamente.',
            side: 'center',
            align: 'center'
          }
        },
        {
          element: '[data-tour="dashboard"]',
          popover: {
            title: '📊 Panel Principal',
            description: 'Aquí verás un resumen de todo: estudiantes, profesores, aulas activas y estadísticas importantes.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="configuracion-section"]',
          popover: {
            title: '⚙️ Paso 1: Configuración',
            description: 'Primero debes configurar las bases del sistema. Abre esta sección para empezar.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="personas-section"]',
          popover: {
            title: '👥 Gestión de Personas',
            description: 'Aquí registrarás a todas las personas que formarán parte del sistema.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="estudiantes"]',
          popover: {
            title: '👦 Paso 2: Estudiantes',
            description: 'Registra a los estudiantes con sus datos personales, documento de identidad y foto.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="padres-de-familia"]',
          popover: {
            title: '👨‍👩‍👧 Padres de Familia',
            description: 'Registra a los padres o apoderados de los estudiantes.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="trabajadores"]',
          popover: {
            title: '👨‍🏫 Paso 3: Trabajadores',
            description: 'Registra a los profesores y personal administrativo que trabajará en la institución.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="academico-section"]',
          popover: {
            title: '📖 Paso 4: Gestión Académica',
            description: 'Una vez registradas las personas, configura la parte académica.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="matrícula"]',
          popover: {
            title: '📝 Matrícula',
            description: 'Matricula a los estudiantes en aulas específicas. Asigna el grado, aula y turno.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="asignación-de-aulas"]',
          popover: {
            title: '🔗 Asignación de Aulas',
            description: 'Asigna profesores a las aulas y cursos. Define quién enseñará qué.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="grados"]',
          popover: {
            title: '🎓 Paso 5: Grados',
            description: 'Crea los grados escolares de tu institución (Inicial 3 años, Inicial 4 años, Primer Grado, etc.)',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="aulas"]',
          popover: {
            title: '🏫 Paso 6: Aulas',
            description: 'Configura las aulas físicas donde se dictarán las clases (Aula Naranja, Aula Verde, etc.)',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="periodo-escolar"]',
          popover: {
            title: '📅 Paso 7: Periodo Escolar',
            description: 'Crea el periodo escolar del año (ejemplo: 2026). Define la fecha de inicio y fin del año académico.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="bimestres"]',
          popover: {
            title: '📆 Paso 8: Bimestres',
            description: 'Genera los bimestres del periodo escolar (Bimestre 1, 2, 3, 4). El sistema calcula las fechas automáticamente.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="cursos"]',
          popover: {
            title: '📚 Paso 9: Cursos',
            description: 'Define los cursos que se dictarán (Matemática, Comunicación, Personal Social, Ciencia y Tecnología, etc.)',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '[data-tour="pensiones"]',
          popover: {
            title: '💰 Paso 10: Pensiones',
            description: 'Establece los montos de matrícula y pensión mensual para cada grado escolar.',
            side: 'right',
            align: 'start'
          }
        },
        {
          element: 'body',
          popover: {
            title: '✅ ¡Listo!',
            description: 'Ya conoces el flujo completo de configuración. Puedes volver a ver este tutorial haciendo clic en el botón de ayuda (?) en la esquina inferior derecha.',
            side: 'center',
            align: 'center'
          }
        }
      ],
      onDestroyStarted: () => {
        driverObj.destroy();
        // Guardar que completó el tour
        localStorage.setItem('admin-tour-completed', 'true');
      },
    });

    driverObj.drive();
  };

  return (
    <button
      onClick={startTour}
      className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 group"
      title="Ver guía del sistema"
    >
      <HelpCircle className="w-6 h-6" />
      <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Ver guía paso a paso
      </span>
    </button>
  );
};

export default SystemTour;
