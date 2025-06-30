import {Component, EventEmitter, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

interface FAQSection {
  id: string;
  title: string;
  icon: string;
  questions: Array<{
    question: string;
    answer: string;
    isExpanded?: boolean;
  }>;
  isExpanded?: boolean;
}

@Component({
  selector: 'app-faq-modal',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './faq-modal.component.html',
  styleUrl: './faq-modal.component.css'
})
export class FaqModalComponent {
  @Output() closeModal = new EventEmitter<void>();

  searchQuery: string = '';
  activeFilter: string = 'all';

  faqSections: FAQSection[] = [
    {
      id: 'acceso',
      title: 'Acceso y Registro',
      icon: '🔐',
      isExpanded: false,
      questions: [
        {
          question: '¿Cómo puedo acceder al sistema por primera vez?',
          answer: 'El acceso se gestiona mediante invitaciones. Un administrador del Grupo Scout debe enviarle una invitación por email. Una vez recibida, puede registrarse siguiendo el enlace proporcionado.',
          isExpanded: false
        },
        {
          question: '¿Olvidé mi contraseña, qué puedo hacer?',
          answer: 'Actualmente el sistema no tiene recuperación automática de contraseñas. Debe contactar a un administrador del sistema para que le restablezca la contraseña.',
          isExpanded: false
        },
        {
          question: '¿Puedo cambiar mi email de acceso?',
          answer: 'Sí, puede modificar su email desde la sección de perfil de usuario. Si no puede acceder a su email actual, contacte a un administrador.',
          isExpanded: false
        },
        {
          question: '¿Por qué no puedo registrarme directamente?',
          answer: 'El sistema es exclusivo para miembros del Grupo Scout José Hernández. Todos los registros deben ser autorizados por la dirigencia para mantener la seguridad y privacidad de los datos.',
          isExpanded: false
        },
        {
          question: '¿Cuánto tiempo dura mi sesión en el sistema?',
          answer: 'Por seguridad, las sesiones tienen una duración limitada. Si no hay actividad por un tiempo prolongado, será necesario iniciar sesión nuevamente.',
          isExpanded: false
        }
      ]
    },
    {
      id: 'familias',
      title: 'Gestión de Scouts y Familias',
      icon: '👨‍👩‍👧‍👦',
      isExpanded: false,
      questions: [
        {
          question: '¿Cómo agrego un nuevo scout a mi familia?',
          answer: 'Los nuevos scouts deben ser registrados por un administrador del sistema. Debe solicitar el alta proporcionando: datos personales del scout, documentación requerida, sección a la que se integrará y autorización parental si es menor de edad.',
          isExpanded: false
        },
        {
          question: '¿Puedo ver la información de scouts de otras familias?',
          answer: 'No. Por privacidad, cada familia solo puede acceder a la información de sus propios scouts. Los educadores pueden ver información de scouts de sus secciones asignadas.',
          isExpanded: false
        },
        {
          question: '¿Cómo actualizo los datos de mi scout?',
          answer: 'Puede actualizar información básica desde su dashboard familiar. Para cambios importantes (cambio de sección, documentación, etc.), debe contactar a un administrador.',
          isExpanded: false
        },
        {
          question: '¿Qué pasa si un scout deja el grupo?',
          answer: 'Debe notificar a un administrador para gestionar la baja. Los datos históricos se conservan por requerimientos administrativos, pero el acceso al sistema se suspende.',
          isExpanded: false
        }
      ]
    },
    {
      id: 'eventos',
      title: 'Eventos y Actividades',
      icon: '🎯',
      isExpanded: false,
      questions: [
        {
          question: '¿Cómo me registro a un evento?',
          answer: '1. Vaya a la sección "Eventos" en su dashboard\n2. Seleccione el evento de interés\n3. Haga clic en "Registrarse"\n4. Complete la información requerida\n5. Confirme la registración',
          isExpanded: false
        },
        {
          question: '¿Puedo cancelar mi registración a un evento?',
          answer: 'Depende de la política del evento específico. Algunos eventos permiten cancelación hasta cierta fecha, otros no. Revise los detalles del evento o contacte al organizador.',
          isExpanded: false
        },
        {
          question: '¿Cómo sé si mi registración fue confirmada?',
          answer: 'Recibirá una notificación en el sistema y por email. En su dashboard aparecerá el estado de su registración (confirmada, en lista de espera, etc.).',
          isExpanded: false
        },
        {
          question: '¿Quién puede crear eventos?',
          answer: 'Los educadores pueden crear eventos para sus secciones. Los administradores pueden crear cualquier tipo de evento. Las familias no pueden crear eventos directamente.',
          isExpanded: false
        }
      ]
    },
    {
      id: 'pagos',
      title: 'Pagos y Cuotas',
      icon: '💰',
      isExpanded: false,
      questions: [
        {
          question: '¿Qué métodos de pago acepta el sistema?',
          answer: 'A través de MercadoPago, el sistema acepta: tarjetas de crédito, tarjetas de débito, transferencias bancarias y otros métodos disponibles en MercadoPago.',
          isExpanded: false
        },
        {
          question: '¿Puedo pagar en cuotas?',
          answer: 'Sí, MercadoPago permite pagos en cuotas según las opciones disponibles de su tarjeta y banco.',
          isExpanded: false
        },
        {
          question: '¿Cómo veo mi histórico de pagos?',
          answer: 'En su dashboard, vaya a la sección "Pagos" donde encontrará: histórico completo de pagos, estado de cuotas pendientes, comprobantes descargables y resumen de cuenta.',
          isExpanded: false
        },
        {
          question: '¿Por qué no veo mi pago reflejado inmediatamente?',
          answer: 'Los pagos pueden tardar algunos minutos en procesarse. Si después de 24 horas no se refleja, contacte al administrador con el comprobante de pago.',
          isExpanded: false
        }
      ]
    },
    {
      id: 'progresion',
      title: 'Progresión Personal',
      icon: '📈',
      isExpanded: false,
      questions: [
        {
          question: '¿Qué es una hoja de marcha?',
          answer: 'Es un documento digital que contiene 12-14 competencias seleccionadas para el desarrollo personal del scout, organizadas por áreas de crecimiento.',
          isExpanded: false
        },
        {
          question: '¿Cómo se aprueban las competencias?',
          answer: '1. El scout completa las actividades de la competencia\n2. Presenta evidencias al educador\n3. El educador evalúa y aprueba o sugiere mejoras\n4. Una vez aprobada, se registra el progreso',
          isExpanded: false
        },
        {
          question: '¿Qué son las áreas de crecimiento?',
          answer: 'Son cuatro dimensiones del desarrollo scout:\n• Desarrollo de la Paz: Valores, ciudadanía, convivencia\n• Salud y Bienestar: Autocuidado, deportes, vida saludable\n• Medio Ambiente: Ecología, sustentabilidad, naturaleza\n• Habilidades para la Vida: Competencias prácticas y técnicas',
          isExpanded: false
        }
      ]
    },
    {
      id: 'seguridad',
      title: 'Seguridad y Privacidad',
      icon: '🔒',
      isExpanded: false,
      questions: [
        {
          question: '¿Quién puede ver la información de mi scout?',
          answer: 'El acceso está restringido a: su familia (acceso completo a sus scouts), educadores de la sección (información necesaria para sus funciones) y administradores (para gestión del sistema).',
          isExpanded: false
        },
        {
          question: '¿Cómo protege el sistema nuestros datos?',
          answer: 'Implementamos múltiples medidas: encriptación de datos sensibles, autenticación JWT segura, acceso basado en roles, copias de seguridad regulares y servidores seguros.',
          isExpanded: false
        },
        {
          question: '¿Se comparten nuestros datos con terceros?',
          answer: 'No. Los datos solo se usan para actividades del Grupo Scout. Los procesadores de pago (MercadoPago) solo reciben información de transacciones, no datos personales completos.',
          isExpanded: false
        }
      ]
    },
    {
      id: 'tecnico',
      title: 'Problemas Técnicos',
      icon: '🔧',
      isExpanded: false,
      questions: [
        {
          question: 'El sistema está lento o no carga, ¿qué puedo hacer?',
          answer: 'Siga estos pasos:\n1. Verifique su conexión a internet\n2. Cierre y abra nuevamente el navegador\n3. Pruebe desde otro dispositivo\n4. Si persiste, contacte al soporte técnico',
          isExpanded: false
        },
        {
          question: '¿Qué navegadores son compatibles?',
          answer: 'El sistema funciona correctamente en: Google Chrome (recomendado), Mozilla Firefox, Safari, Microsoft Edge y versiones modernas de navegadores móviles.',
          isExpanded: false
        },
        {
          question: '¿Puedo usar el sistema desde mi celular?',
          answer: 'Sí, el sistema está optimizado para dispositivos móviles. Use el navegador de su celular para acceder a la misma URL.',
          isExpanded: false
        }
      ]
    },
    {
      id: 'roles',
      title: 'Roles y Permisos',
      icon: '👥',
      isExpanded: false,
      questions: [
        {
          question: '¿Cuáles son los diferentes roles en el sistema?',
          answer: '• Familias: Gestión de sus scouts, eventos y pagos\n• Educadores: Gestión de scouts de sus secciones y progresión\n• Administradores: Acceso completo al sistema',
          isExpanded: false
        },
        {
          question: '¿Puedo tener múltiples roles?',
          answer: 'Sí, una persona puede ser familia y educador simultáneamente. El sistema mostrará las opciones relevantes para cada rol.',
          isExpanded: false
        },
        {
          question: '¿Puede un educador ver información de scouts de otras secciones?',
          answer: 'No, los educadores solo pueden acceder a información de scouts de las secciones que tienen asignadas.',
          isExpanded: false
        }
      ]
    }
  ];

  get filteredSections() {
    let sections = this.faqSections;

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      sections = sections.map(section => ({
        ...section,
        questions: section.questions.filter(q => 
          q.question.toLowerCase().includes(query) || 
          q.answer.toLowerCase().includes(query)
        )
      })).filter(section => section.questions.length > 0);
    }

    // Apply category filter
    if (this.activeFilter !== 'all') {
      sections = sections.filter(section => section.id === this.activeFilter);
    }

    return sections;
  }

  toggleSection(sectionId: string) {
    const section = this.faqSections.find(s => s.id === sectionId);
    if (section) {
      section.isExpanded = !section.isExpanded;
    }
  }

  toggleQuestion(sectionId: string, questionIndex: number) {
    const section = this.faqSections.find(s => s.id === sectionId);
    if (section && section.questions[questionIndex]) {
      section.questions[questionIndex].isExpanded = !section.questions[questionIndex].isExpanded;
    }
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
  }

  expandAll() {
    this.filteredSections.forEach(section => {
      section.isExpanded = true;
      section.questions.forEach(q => q.isExpanded = true);
    });
  }

  collapseAll() {
    this.faqSections.forEach(section => {
      section.isExpanded = false;
      section.questions.forEach(q => q.isExpanded = false);
    });
  }

  onClose() {
    this.closeModal.emit();
  }

  // Handle ESC key to close modal
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onClose();
    }
  }

  // TrackBy functions for better performance
  trackBySection(index: number, section: FAQSection): string {
    return section.id;
  }

  trackByQuestion(index: number, question: any): number {
    return index;
  }
}