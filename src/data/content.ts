// Contenido del sitio. Los textos entre [corchetes] son datos pendientes de confirmar con la clínica.

export const site = {
  name: 'Alaria Clínica Estética',
  tagline: 'Realza tu belleza con respaldo médico.',
  description:
    'Medicina estética con criterio médico en Guatemala. Primero una valoración médica y después, si tiene sentido, un tratamiento. Reserva tu cita.',
  whatsapp: '50236038581',
  whatsappMessage: 'Hola, quisiera información sobre una valoración en Alaria Clínica Estética.',
  doctor: {
    title: 'Equipo médico',
    bioShort:
      'Cada caso se atiende con criterio médico: primero se evalúa, después se propone y se acompaña el seguimiento. [pendiente: años de experiencia del equipo]',
    bioLong: [
      'La atención en Alaria Clínica Estética está a cargo de nuestro equipo médico.',
      'Cada consulta empieza con tu historial, tus objetivos y una revisión de contraindicaciones. Solo después se decide si un tratamiento tiene sentido en tu caso.',
      '[dato médico pendiente: trayectoria del equipo y áreas de especial interés]',
    ],
    credentials: [
      '[dato médico pendiente: títulos y universidad del profesional médico responsable]',
      '[dato médico pendiente: número de colegiado del profesional responsable]',
      '[dato médico pendiente: certificaciones en medicina estética]',
      '[dato médico pendiente: formación en procedimientos específicos]',
    ],
  },
};

/** `short` es la etiqueta de la barra inferior móvil. */
export const nav = [
  { label: 'Inicio', short: 'Inicio', href: '/' },
  { label: 'Tratamientos', short: 'Tratamientos', href: '/tratamientos/' },
  { label: 'Resultados', short: 'Resultados', href: '/resultados/' },
  { label: 'Visítanos', short: 'Visítanos', href: '/visitanos/' },
  { label: 'Reservar valoración', short: 'Reservar', href: '/agendar/' },
];

export const home = {
  eyebrow: 'Alaria Clínica Estética · Guatemala',
  h1: 'Clínica de medicina estética en Guatemala',
  lead: 'En nuestra consulta de medicina estética ofrecemos un enfoque personalizado que combina conocimiento médico y técnicas especializadas para realzar tu belleza natural y cuidar tu piel.',
  ctaPrimary: 'Reservar mi valoración',
  ctaSecondary: 'Escribir por WhatsApp',
  ctaTertiary: 'Ver tratamientos',
  approach: {
    title: 'Cómo trabajamos',
    intro: 'Cuatro principios guían cada consulta en Alaria.',
    pillars: [
      {
        title: 'Valoración médica personalizada',
        text: 'Cada tratamiento comienza conociendo tus necesidades.',
      },
      {
        title: 'Enfoque científico',
        text: 'Procedimientos basados en conocimiento médico y técnicas especializadas.',
      },
      {
        title: 'Resultados naturales',
        text: 'Buscamos armonizar y realzar, sin perder tu esencia.',
      },
      {
        title: 'Seguridad y confianza',
        text: 'Te acompañamos durante todo el proceso.',
      },
    ],
  },
  difference: {
    title: '¿Qué nos hace diferentes?',
    intro: 'Así es cada paso, desde la primera consulta hasta el seguimiento.',
    items: [
      {
        title: 'Valoración médica personalizada',
        text: 'Conocemos tus necesidades, antecedentes y objetivos estéticos, y analizamos tu piel y tu rostro para recomendarte las opciones más adecuadas, con sus beneficios y consideraciones.',
      },
      {
        title: 'Plan y presupuesto antes de empezar',
        text: 'Antes de empezar sabes qué zonas se tratarían, con qué técnica y cuánto costaría. El presupuesto es personalizado y transparente.',
      },
      {
        title: 'Sabes qué producto se usa',
        text: 'Te decimos qué producto se usará antes de cualquier procedimiento. Lo elegimos según tus necesidades, con prioridad en calidad y seguridad.',
      },
      {
        title: 'Revisión después del tratamiento',
        text: 'Revisamos tu evolución y ajustamos el plan si hace falta. [pendiente: fechas de control]',
      },
      {
        title: 'Atención con cita previa',
        text: 'Te esperamos con horario reservado. Confirmas tu hora antes de llegar.',
      },
      {
        title: 'Dudas antes de reservar',
        text: 'Escríbenos por WhatsApp y te orientamos antes de decidir. [pendiente: tiempo de respuesta]',
      },
    ],
    cta: 'Elegir fecha para mi valoración',
  },
  doctorTeaser: {
    title: 'Quién te atiende',
    text: 'Evaluamos primero y proponemos después. Conoce la formación de nuestro equipo médico y cómo trabajamos. [dato médico pendiente: años de experiencia]',
    cta: 'Leer más sobre el equipo',
  },
  treatmentsTeaser: {
    title: 'Tratamientos',
    intro: 'Cuatro líneas de trabajo. Todas empiezan con la misma valoración.',
  },
  faqTeaser: {
    title: 'Preguntas frecuentes',
  },
};

export type Treatment = {
  slug: string;
  number: string;
  name: string;
  short: string;
  metaDescription: string;
  intro: string;
  forWho: string[];
  whatToExpect: { step: string; text: string }[];
  facts: { label: string; value: string }[];
  faq: { q: string; a: string }[];
  beforeDeciding: string[];
};

const beforeDeciding = [
  'Requiere valoración médica previa.',
  'Las contraindicaciones se confirman en tu consulta.',
  'Los resultados varían según cada persona.',
];

// El encabezado "Antes de decidir" lo pone la plantilla.
export const treatments: Treatment[] = [
  {
    slug: 'armonizacion-facial',
    number: '01',
    name: 'Armonización facial',
    short: 'Evaluamos proporciones del rostro y definimos qué zonas tienen sentido trabajar.',
    metaDescription:
      'Armonización facial en Guatemala con valoración médica previa. Conoce para quién es, qué esperar y qué confirmar antes de decidir contigo.',
    intro:
      'La armonización facial busca un rostro más equilibrado según tus rasgos. Primero revisamos tus proporciones y tus objetivos; el plan se define después.',
    forWho: [
      'Quienes quieren mejorar el equilibrio general del rostro.',
      'Quienes buscan un resultado natural y gradual.',
      'Quienes desean una opinión médica antes de decidir.',
    ],
    whatToExpect: [
      { step: 'Valoración', text: 'Revisamos tu historial, tus objetivos y tus contraindicaciones.' },
      { step: 'Plan', text: 'Te explicamos qué zonas podrían tratarse, con qué técnica y qué resultado es realista.' },
      {
        step: 'Procedimiento',
        text: 'Se realiza en consultorio con los productos que confirmamos contigo. [dato médico pendiente: técnica y productos utilizados]',
      },
      {
        step: 'Seguimiento',
        text: 'Revisamos tu evolución y ajustamos el plan si hace falta. [dato médico pendiente: citas de control]',
      },
    ],
    facts: [
      { label: 'Duración', value: '[dato médico pendiente: duración del procedimiento]' },
      { label: 'Sesiones', value: '[dato médico pendiente: número de sesiones]' },
      { label: 'Recuperación', value: '[dato médico pendiente: tiempo de recuperación y cuidados posteriores]' },
    ],
    faq: [
      {
        q: '¿Cuánto dura el procedimiento?',
        a: 'Depende del plan que definamos en tu valoración. [dato médico pendiente: duración estimada]',
      },
      {
        q: '¿Duele?',
        a: 'La sensibilidad varía según la zona y la persona. Te explicamos las opciones para tu comodidad durante la valoración. [dato médico pendiente: manejo de molestias]',
      },
      {
        q: '¿Se notará?',
        a: 'El objetivo es un resultado natural, pero cada rostro es distinto. Lo revisamos contigo en la valoración.',
      },
    ],
    beforeDeciding,
  },
  {
    slug: 'toxina-botulinica',
    number: '02',
    name: 'Toxina botulínica',
    short: 'Trabajamos líneas de expresión solo si tu valoración lo indica.',
    metaDescription:
      'Toxina botulínica en Guatemala con valoración médica previa. Conoce para quién es, cómo se planifica y qué confirmar antes de decidir.',
    intro:
      'La toxina botulínica se usa en líneas de expresión dinámicas. Antes de proponerla, evaluamos si es la opción adecuada para ti.',
    forWho: [
      'Quienes notan líneas de expresión en frente, entrecejo o contorno de ojos.',
      'Quienes buscan una expresión natural y un plan gradual.',
      'Quienes quieren entender sus alternativas antes de empezar.',
    ],
    whatToExpect: [
      { step: 'Valoración', text: 'Revisamos tus gestos, tu historial y tus contraindicaciones.' },
      { step: 'Plan', text: 'Te explicamos las zonas posibles, las dosis orientativas y el resultado esperado.' },
      {
        step: 'Procedimiento',
        text: 'Se aplica en consultorio, con productos confirmados contigo. [dato médico pendiente: técnica y producto utilizado]',
      },
      {
        step: 'Seguimiento',
        text: 'Revisamos el resultado y ajustamos si hace falta. [dato médico pendiente: fecha de control]',
      },
    ],
    facts: [
      { label: 'Duración', value: '[dato médico pendiente: duración del procedimiento]' },
      { label: 'Sesiones', value: '[dato médico pendiente: número de sesiones y frecuencia]' },
      { label: 'Recuperación', value: '[dato médico pendiente: tiempo para ver el efecto y cuidados posteriores]' },
    ],
    faq: [
      {
        q: '¿Cuánto tarda en notarse el efecto?',
        a: 'Varía según la zona y la persona. [dato médico pendiente: tiempo estimado de efecto]',
      },
      {
        q: '¿Duele?',
        a: 'Algunas personas sienten molestias leves durante la aplicación. Te explicamos cómo se maneja en tu valoración. [dato médico pendiente: manejo de molestias]',
      },
      {
        q: '¿Se pierde el efecto?',
        a: 'El efecto no es permanente. Te explicamos la frecuencia recomendada según tu plan. [dato médico pendiente: duración del efecto]',
      },
    ],
    beforeDeciding,
  },
  {
    slug: 'bioestimuladores',
    number: '03',
    name: 'Bioestimuladores de colágeno',
    short: 'Pueden apoyar la producción de colágeno de forma gradual.',
    metaDescription:
      'Bioestimuladores de colágeno en Guatemala con valoración médica previa. Conoce para quién son, qué esperar y qué confirmar antes de decidir.',
    intro:
      'Los bioestimuladores se usan para apoyar la firmeza de la piel de forma gradual. El producto y el número de sesiones dependen de tu valoración.',
    forWho: [
      'Quienes notan pérdida de firmeza o volumen en el rostro.',
      'Quienes prefieren un resultado gradual.',
      'Quienes buscan un plan a mediano plazo.',
    ],
    whatToExpect: [
      { step: 'Valoración', text: 'Revisamos tu piel, tu historial y tus contraindicaciones.' },
      { step: 'Plan', text: 'Te explicamos el producto recomendado, las zonas y el calendario orientativo.' },
      {
        step: 'Procedimiento',
        text: 'Se aplica en consultorio con el producto confirmado. [dato médico pendiente: producto y técnica utilizados]',
      },
      {
        step: 'Seguimiento',
        text: 'Revisamos tu evolución entre sesiones. [dato médico pendiente: intervalo entre sesiones]',
      },
    ],
    facts: [
      { label: 'Duración', value: '[dato médico pendiente: duración del procedimiento]' },
      { label: 'Sesiones', value: '[dato médico pendiente: número de sesiones]' },
      { label: 'Recuperación', value: '[dato médico pendiente: molestias esperables y cuidados posteriores]' },
    ],
    faq: [
      {
        q: '¿Cuándo se notan los resultados?',
        a: 'El efecto es gradual y varía según la persona. [dato médico pendiente: tiempo estimado de resultados]',
      },
      {
        q: '¿Qué productos se usan?',
        a: 'Te informamos qué producto se usará antes de cualquier procedimiento. [dato médico pendiente: productos y registros sanitarios]',
      },
      {
        q: '¿Hay que repetirlo?',
        a: 'Depende del plan. Lo definimos en tu valoración. [dato médico pendiente: frecuencia de mantenimiento]',
      },
    ],
    beforeDeciding,
  },
  {
    slug: 'calidad-de-piel',
    number: '04',
    name: 'Calidad de piel',
    short: 'Tratamientos para textura, hidratación y luminosidad, según tu tipo de piel.',
    metaDescription:
      'Tratamientos para calidad de piel en Guatemala con valoración médica previa. Conoce las opciones según tu tipo de piel antes de decidir.',
    intro:
      'Trabajamos la textura, la hidratación y el aspecto general de la piel. Primero identificamos tu tipo de piel y tus necesidades.',
    forWho: [
      'Quienes notan piel opaca, deshidratada o con textura irregular.',
      'Quienes tienen manchas o cicatrices leves que quieren evaluar.',
      'Quienes buscan un plan de cuidado con criterio médico.',
    ],
    whatToExpect: [
      { step: 'Valoración', text: 'Revisamos tu tipo de piel, tu historial y tus contraindicaciones.' },
      { step: 'Plan', text: 'Te explicamos el tratamiento recomendado y los cuidados en casa.' },
      {
        step: 'Procedimiento',
        text: 'Se realiza en consultorio con los productos confirmados contigo. [dato médico pendiente: técnica y productos utilizados]',
      },
      {
        step: 'Seguimiento',
        text: 'Revisamos tu piel y ajustamos el plan. [dato médico pendiente: sesiones de control]',
      },
    ],
    facts: [
      { label: 'Duración', value: '[dato médico pendiente: duración del procedimiento]' },
      { label: 'Sesiones', value: '[dato médico pendiente: número de sesiones]' },
      {
        label: 'Recuperación',
        value: '[dato médico pendiente: enrojecimiento o descamación esperables y cuidados posteriores]',
      },
    ],
    faq: [
      {
        q: '¿Cuánto tarda la recuperación?',
        a: 'Depende del tratamiento y de tu piel. [dato médico pendiente: tiempo de recuperación por tratamiento]',
      },
      {
        q: '¿Sirve para cualquier tipo de piel?',
        a: 'No necesariamente. Por eso empezamos con una valoración de tu piel. [dato médico pendiente: tipos de piel no indicados]',
      },
      {
        q: '¿Qué cuidados debo tener después?',
        a: 'Te damos instrucciones por escrito en cada sesión. [dato médico pendiente: protocolo de cuidados posteriores]',
      },
    ],
    beforeDeciding,
  },
];

export const faq = [
  {
    q: '¿Qué pasa en la primera cita?',
    a: 'Realizamos una valoración médica personalizada en la que conocemos tus necesidades, antecedentes y objetivos estéticos. Evaluamos las características de tu piel y rostro para recomendarte las opciones más adecuadas para ti, explicando sus beneficios y posibles consideraciones.',
  },
  {
    q: '¿Los tratamientos son dolorosos? ¿Necesito tiempo de recuperación?',
    a: 'La sensación y el tiempo de recuperación dependen del procedimiento realizado. Algunos tratamientos generan molestias leves y transitorias, mientras que otros pueden requerir cuidados específicos. Te orientaremos sobre qué esperar antes y después de cada tratamiento.',
  },
  {
    q: '¿Los resultados se verán naturales?',
    a: 'Nuestro objetivo es realzar tu belleza respetando tus rasgos y proporciones. Buscamos resultados armónicos y naturales, adaptados a tus características faciales y expectativas.',
  },
  {
    q: '¿Qué productos utilizan?',
    a: 'Trabajamos con productos de uso médico-estético, seleccionados según las necesidades de cada paciente, priorizando su calidad, procedencia y seguridad. Te informaremos sobre el producto indicado para tu tratamiento.',
  },
  {
    q: '¿Cómo reservo mi valoración?',
    a: 'Llena el formulario de reserva o escríbenos por WhatsApp. Te confirmamos fecha y hora. [pendiente: tiempo de respuesta]',
  },
  {
    q: '¿Cuál es el precio de cada tratamiento?',
    a: 'El costo depende del tratamiento indicado, las áreas a tratar y las necesidades individuales de cada paciente. Después de tu valoración, te proporcionaremos un presupuesto personalizado y transparente. [pendiente: costo de la valoración o si es gratuita]',
  },
];

export const results = {
  title: 'Resultados',
  intro:
    'Mostramos casos solo con autorización escrita de cada paciente. Cada caso es distinto, y los resultados varían.',
  beforeAfter: {
    title: 'Antes y después',
    emptyState: 'Pronto compartiremos casos con autorización de cada paciente.',
    consentNote:
      'Solo publicamos fotografías con consentimiento escrito y sin rasgos que permitan identificarte. Puedes pedir que retiremos la tuya en cualquier momento.',
  },
  testimonials: {
    title: 'Opiniones de pacientes',
    emptyState: 'Pronto compartiremos opiniones de pacientes que nos autoricen.',
    googleCta: 'Ver reseñas en Google [pendiente: enlace al perfil de Google Business]',
  },
};

export const visit = {
  title: 'Visítanos',
  intro: 'Te esperamos con cita previa. Confirma tu horario antes de llegar.',
  address: '[pendiente: dirección completa del consultorio]',
  mapsQuery: '[pendiente: dirección para el enlace de Google Maps]',
  hours: [
    { day: 'Lunes a viernes', time: '[pendiente: horario]' },
    { day: 'Sábado', time: '[pendiente: horario]' },
  ],
  contactNote: 'Para cambios de cita, escríbenos por WhatsApp. [pendiente: teléfono fijo y correo]',
};

export const booking = {
  title: 'Reserva tu valoración',
  intro:
    'Llena el formulario y te confirmamos la cita. Solo pedimos los datos necesarios para preparar tu consulta.',
  // Clave pública de Web3Forms: identifica el formulario, no es un secreto.
  web3formsKey: 'd59195be-15a6-4e3c-af03-01120f9995df',
  endpoint: 'https://api.web3forms.com/submit',
  form: {
    name: 'Nombre completo',
    phone: 'Teléfono o WhatsApp',
    email: 'Correo electrónico (opcional)',
    treatment: 'Tratamiento de interés (opcional)',
    message: 'Cuéntanos qué te preocupa (opcional)',
    submit: 'Reservar mi valoración',
    sending: 'Enviando tu solicitud…',
    success: 'Recibimos tu solicitud. Te escribiremos para confirmar fecha y hora.',
    error:
      'No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo, o escríbenos por WhatsApp.',
    offline:
      'Sin conexión. Tu solicitud no se envió. Intenta de nuevo cuando vuelvas a estar en línea o escríbenos por WhatsApp.',
    privacy: 'Usamos tus datos solo para agendar y preparar tu valoración.',
  },
  validation: {
    required: 'Este campo es obligatorio.',
    email: 'Escribe un correo válido, por ejemplo nombre@correo.com.',
    phone: 'Escribe un número de 8 dígitos, por ejemplo 5555 5555.',
  },
  whatsappAlt: '¿Prefieres hablar primero? Escríbenos por WhatsApp.',
  // Calendario de Cal.com: `usuario/evento` o la URL pública del evento. Vacío = se muestra el formulario.
  // Horario, zona horaria, SMS, correos y .ics se configuran en Cal.com, no aquí.
  calendar: {
    link: 'alaria-hb0huy/valoracion',
    intro:
      'Elige el día y la hora que te queden mejor. Al reservar te llega la confirmación con un archivo para agregar la cita a tu calendario.',
    timezone: 'Los horarios están en hora de Guatemala.',
    fallback: '¿No carga el calendario? Ábrelo en Cal.com.',
  },
};

export const footer = {
  note: 'Alaria Clínica Estética. Medicina estética con criterio médico.',
  legal: '© 2026 Alaria Clínica Estética.',
  credentials:
    'Médico responsable: colegiado activo n.º [pendiente: número de colegiado]. Licencia sanitaria MSPAS n.º [pendiente: número de licencia sanitaria].',
  privacyLink: 'Aviso de privacidad',
};

// Borrador de aviso de privacidad. Guatemala no tiene aún ley general de protección de datos
// (iniciativa 6464 en trámite, 2026); este texto debe revisarlo un abogado antes de darlo por final.
export const privacy = {
  title: 'Aviso de privacidad',
  intro:
    'Te explicamos qué datos pedimos, para qué los usamos y cómo puedes pedir que los corrijamos o los borremos.',
  updated: 'Última actualización: octubre de 2026. [pendiente: revisión legal]',
  sections: [
    {
      title: 'Quién es responsable de tus datos',
      paragraphs: [
        'Alaria Clínica Estética, con domicilio en [pendiente: dirección completa del consultorio]. Para cualquier asunto sobre tus datos escríbenos a [pendiente: correo de contacto] o por WhatsApp.',
      ],
    },
    {
      title: 'Qué datos pedimos',
      paragraphs: [
        'Al reservar tu valoración te pedimos nombre, teléfono o WhatsApp y, si quieres, correo electrónico, el tratamiento que te interesa y un comentario. Te recomendamos no escribir información médica detallada en el formulario: la revisamos contigo en consulta.',
        'Este sitio no usa herramientas de analítica ni cookies publicitarias.',
      ],
    },
    {
      title: 'Para qué los usamos',
      paragraphs: [
        'Solo para confirmar, cambiar o recordarte tu cita y preparar tu valoración. No vendemos ni cedemos tus datos, y no te enviaremos publicidad sin tu permiso.',
      ],
    },
    {
      title: 'Servicios que nos ayudan',
      paragraphs: [
        'Para recibir tus solicitudes usamos servicios externos que pueden guardar los datos fuera de Guatemala: Cal.com (calendario de citas), Web3Forms (envío del formulario) y WhatsApp (mensajes). El proveedor que aloja este sitio puede registrar datos técnicos, como la dirección IP, para su funcionamiento y seguridad.',
      ],
    },
    {
      title: 'Cuánto tiempo los guardamos',
      paragraphs: [
        'Los datos de una reserva se conservan mientras sean necesarios para atenderte. [pendiente: plazo de conservación]',
        'Tu expediente clínico se maneja aparte, con la confidencialidad y el secreto profesional que exige la práctica médica.',
      ],
    },
    {
      title: 'Tus derechos',
      paragraphs: [
        'Puedes pedirnos en cualquier momento ver, corregir o borrar tus datos de reserva, o retirar el permiso para publicar una fotografía tuya. Respondemos tu solicitud por el mismo medio por el que nos escribas.',
      ],
    },
  ],
};
